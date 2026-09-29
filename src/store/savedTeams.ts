import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue3-toastify"
import { useSetting } from "./settingsStore"
import { useCharacterStore } from "./characterStore"
import { useCloudListSync } from "./cloudListSync"
import { deleteSavedTeam, getFriendCode, loadMySavedTeams, loadSharedTeam as fetchSharedTeam, saveTeam, saveTeamOrder } from "./cloud"
import { clampName, isUuid } from "../utils/tierList"
import { compactTeams, expandTeams, isTeamsEmpty, rowToTeam, sanitizeTeamSlots, teamsKey } from "../utils/savedTeams"
import { generateShareLink, latestPrettyUrl, prettyShareId, refreshSharePreview, type ImageExportOptions, type ShareLinkOptions } from "../utils/image"
import type { TeamSlot } from "../types/BestTeamTypes"
import type { SavedTeam, SavedTeamKind, SharedTeam } from "../types/SavedTeamTypes"

const toastOpts = { position: toast.POSITION.TOP_RIGHT, icon: false } as const

export interface SavedTeamsOptions {
    kind: SavedTeamKind
    /** Route path of the simulator page, used to build share links. */
    routePath: string
    /** Label used in titles, e.g. "PvP Team". */
    label: string
    /** The simulator's current slots (one array of 5 slots per team). */
    getSlots: () => TeamSlot[][]
    /** Replaces the simulator's slots. */
    applySlots: (slots: TeamSlot[][]) => void
    /** Element captured for share previews, and how to capture it. */
    shareTarget: () => string | HTMLElement
    exportOptions: ImageExportOptions
}

/**
 * Named teams for a simulator page, working like the Tier List Maker's lists: kept in this browser,
 * backed up to the cloud when there is a cloud profile, and shareable by link.
 *
 * The simulator's own store stays the working copy. While a saved team is active, every edit in the
 * simulator is written into it, and a newer version synced from another device is loaded back in.
 */
export function useSavedTeams(options: SavedTeamsOptions) {
    const { kind } = options
    const characterStore = useCharacterStore()
    const route = useRoute()
    const router = useRouter()

    const teams = useSetting<Record<string, SavedTeam>>(`${kind}SavedTeams`, {})
    const teamOrder = useSetting<string[]>(`${kind}SavedTeamOrder`, [])
    const activeTeamId = useSetting<string>(`${kind}ActiveTeamId`, "")

    const sync = useCloudListSync(teams, teamOrder, {
        settingsPrefix: `${kind}SavedTeams`,
        noun: "teams",
        load: () => loadMySavedTeams(kind),
        save: (team, sortOrder, known) => saveTeam(kind, team, sortOrder, known),
        saveOrder: ids => saveTeamOrder(kind, ids),
        remove: deleteSavedTeam,
        rowToItem: row => rowToTeam(row, kind),
        sanitize: team => ({ ...team, name: clampName(team.name), slots: sanitizeTeamSlots(team.slots, kind) }),
        displayName: team => team.name || "Untitled team",
    })
    const cloudEnabled = sync.active()

    const byCreation = (a: SavedTeam, b: SavedTeam) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)

    const teamOptions = computed(() => {
        const seen = new Set<string>()
        const ordered: SavedTeam[] = []
        for (const id of teamOrder.value) {
            const team = teams.value[id]
            if (team && !seen.has(id)) {
                ordered.push(team)
                seen.add(id)
            }
        }
        Object.values(teams.value).filter(t => !seen.has(t.id)).sort(byCreation).forEach(t => ordered.push(t))
        return ordered
    })

    const currentTeam = computed<SavedTeam | null>(() =>
        activeTeamId.value ? teams.value[activeTeamId.value] ?? null : null
    )

    const catalog = computed(() => new Map(characterStore.characters.map(c => [c.id, c] as const)))
    const workingSlots = () => compactTeams(options.getSlots(), kind)
    const workingKey = computed(() => teamsKey(workingSlots()))
    const workingIsEmpty = computed(() => isTeamsEmpty(workingSlots()))
    /** The simulator holds characters that aren't saved in any team. */
    const hasUnsavedSetup = computed(() =>
        !currentTeam.value && !workingIsEmpty.value && !teamOptions.value.some(t => teamsKey(t.slots) === workingKey.value)
    )

    function apply(team: SavedTeam) {
        options.applySlots(expandTeams(team.slots, catalog.value))
    }

    function putTeam(team: SavedTeam) {
        teams.value = { ...teams.value, [team.id]: { ...team, updatedAt: Date.now() } }
    }

    function addTeam(team: SavedTeam) {
        teams.value = { ...teams.value, [team.id]: team }
        teamOrder.value = [...teamOrder.value.filter(id => id !== team.id), team.id]
        activeTeamId.value = team.id
    }

    function newTeam(name: string, slots = workingSlots()): SavedTeam {
        const now = Date.now()
        return { id: crypto.randomUUID(), name: clampName(name), slots, createdAt: now, updatedAt: now }
    }

    const nextName = () => `Team ${teamOptions.value.length + 1}`

    /** Saves what's in the simulator as a new team and makes it the active one. */
    function saveCurrentAsNew() {
        addTeam(newTeam(nextName()))
        toast.success("Team saved!", toastOpts)
    }

    function selectTeam(id: string) {
        const team = teams.value[id]
        if (!team || id === activeTeamId.value) return
        if (hasUnsavedSetup.value && !window.confirm("Your current setup isn't saved as a team. Replace it with this team?")) return
        activeTeamId.value = id
        apply(team)
    }

    function duplicateTeam() {
        const src = currentTeam.value
        if (!src) return
        addTeam(newTeam(`${src.name} (copy)`, sanitizeTeamSlots(src.slots, kind)))
        toast.success("Team duplicated!", toastOpts)
    }

    function deleteTeam() {
        const deletedId = currentTeam.value?.id
        if (!deletedId) return
        const { [deletedId]: _removed, ...rest } = teams.value
        teams.value = rest
        teamOrder.value = teamOrder.value.filter(id => id !== deletedId)
        // The simulator keeps showing the deleted team; it's just not saved anywhere any more.
        activeTeamId.value = ""
        void sync.remove(deletedId)
        toast.success("Team deleted", toastOpts)
    }

    function renameTeam(name: string) {
        if (!currentTeam.value) return
        putTeam({ ...currentTeam.value, name: clampName(name) })
    }

    function setTeamShared(value: boolean) {
        if (!currentTeam.value || !cloudEnabled) return
        putTeam({ ...currentTeam.value, shared: value })
    }

    function reorderTeams(ids: string[]) {
        teamOrder.value = ids
    }

    /** Stops writing simulator edits into the active team (e.g. before importing something else). */
    function detach() {
        activeTeamId.value = ""
    }

    // ── Keeping the simulator and the active team in step ──

    // Edits in the simulator are saved into the active team.
    watch(workingKey, key => {
        const team = currentTeam.value
        if (team && key !== teamsKey(team.slots)) putTeam({ ...team, slots: workingSlots() })
    })

    // A different version of the active team (switched, or synced from another device) is loaded.
    watch(() => currentTeam.value && teamsKey(currentTeam.value.slots), key => {
        if (key && key !== workingKey.value) apply(currentTeam.value!)
    })

    // ── Shared (someone else's) teams, opened by `?team=<id>` ──

    const sharedTeamId = computed(() => {
        const id = route.query.team
        return isUuid(id) ? id.toLowerCase() : null
    })
    const isSharedView = computed(() => !!sharedTeamId.value && !teams.value[sharedTeamId.value])
    const shared = ref<SharedTeam | null>(null)
    const sharedState = ref<"loading" | "notfound" | "error">("loading")

    const teamUrl = (id: string) => `${window.location.origin}/exedra-dmg-calc/#${options.routePath}?team=${id}`

    async function openSharedFromRoute() {
        shared.value = null
        const id = sharedTeamId.value
        if (!id) return
        if (teams.value[id]) {
            selectTeam(id)
            return
        }
        sharedState.value = "loading"
        try {
            const result = await fetchSharedTeam(id)
            if (sharedTeamId.value !== id) return // navigated elsewhere while loading
            if (!result || result.kind !== kind) {
                sharedState.value = "notfound"
                return
            }
            shared.value = result
        } catch (err) {
            console.error("Failed to load shared team:", err)
            if (sharedTeamId.value === id) sharedState.value = "error"
        }
    }

    function leaveSharedView() {
        const { team: _team, ...query } = route.query
        void router.replace({ path: route.path, query })
    }

    /** Loads the shared team into the simulator without saving it. */
    function loadSharedTeam() {
        const src = shared.value?.team
        if (!src) return
        if (hasUnsavedSetup.value && !window.confirm("Your current setup isn't saved as a team. Replace it with this team?")) return
        detach()
        apply(src)
        leaveSharedView()
        toast.success("Team loaded into the simulator", toastOpts)
    }

    function saveSharedCopy() {
        const src = shared.value?.team
        if (!src) return
        if (hasUnsavedSetup.value && !window.confirm("Your current setup isn't saved as a team. Replace it with this team?")) return
        const copy = newTeam(src.name || "Shared team", sanitizeTeamSlots(src.slots, kind))
        addTeam(copy)
        apply(copy)
        leaveSharedView()
        toast.success("Saved to your teams!", toastOpts)
    }

    watch(sharedTeamId, openSharedFromRoute)

    function dropMissingActive() {
        if (activeTeamId.value && !teams.value[activeTeamId.value]) activeTeamId.value = ""
    }

    // Another page (e.g. "open in simulator" from the Best Team Calculator or the PvE simulator) may
    // have replaced the simulator's team. Don't overwrite either side: just stop tracking the saved team.
    dropMissingActive()
    if (currentTeam.value && teamsKey(currentTeam.value.slots) !== workingKey.value) detach()

    onMounted(async () => {
        const pulling = sync.pull().then(dropMissingActive)
        // Opening my own share link should land on the synced team, so wait for the merge in that case.
        if (sharedTeamId.value) await pulling
        await openSharedFromRoute()
    })

    // ── Sharing ──

    const shareOptions = (): ShareLinkOptions => {
        const team = isSharedView.value ? shared.value?.team : currentTeam.value
        return {
            title: `${team?.name || "My"} ${options.label}`,
            backUrl: team && (isSharedView.value || team.shared) ? teamUrl(team.id) : window.location.href,
        }
    }

    const previewId = (friendCode: string, team: SavedTeam) =>
        prettyShareId(friendCode, `${kind}-team ${team.name} ${team.id.slice(0, 6)}`)

    async function generateShareUrl(): Promise<string> {
        if (isSharedView.value) {
            const team = shared.value?.team
            if (!team) throw new Error("No team to share")
            const friendCode = shared.value?.ownerFriendId
            return friendCode ? await latestPrettyUrl(previewId(friendCode, team)) : teamUrl(team.id)
        }

        if (!cloudEnabled) {
            // Without a cloud profile the team has nowhere to live: share a one-off image instead.
            return await generateShareLink(options.shareTarget(), options.exportOptions, shareOptions())
        }

        if (!currentTeam.value) addTeam(newTeam(nextName()))
        const team = currentTeam.value!
        if (!team.shared) setTeamShared(true)
        // The link only works once the server has the team with sharing switched on.
        await sync.flush()
        if (!sync.isSynced(team.id) || !teams.value[team.id]?.shared) {
            throw new Error("Couldn't upload this team. Check your connection and try again.")
        }

        const friendCode = await getFriendCode()
        if (!friendCode) throw new Error("Couldn't resolve your friend code.")
        return await refreshSharePreview(options.shareTarget(), previewId(friendCode, teams.value[team.id]), {
            ...shareOptions(),
            redirectHumans: true,
        })
    }

    return {
        kind,
        teamOptions,
        currentTeam,
        activeTeamId,
        hasUnsavedSetup,
        workingIsEmpty,
        catalog,
        syncStatus: sync.status,
        cloudEnabled,
        retrySync: () => { void sync.pull() },
        saveCurrentAsNew,
        selectTeam,
        duplicateTeam,
        deleteTeam,
        renameTeam,
        setTeamShared,
        reorderTeams,
        detach,
        isSharedView,
        shared,
        sharedState,
        openSharedFromRoute,
        leaveSharedView,
        loadSharedTeam,
        saveSharedCopy,
        shareOptions,
        generateShareUrl,
    }
}

export type SavedTeams = ReturnType<typeof useSavedTeams>
