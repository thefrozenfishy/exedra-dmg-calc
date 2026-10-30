// exedra.wiki battle page of a quest stage, named the way ma-ex-data puts it on the wiki, in two steps:
//  1. wiki/generator_battle_pages.py generate(): the file name. One page per quest group, with its renames (Score
//     Attack pages under their event's name, Upgrade Quests, Chaos Mode, Exedra Crisis / Link Raid by season date,
//     Tower pages in 50-stage tabs with the themed towers as extra tabs), then wiki_helpers.wikify_name.
//  2. wiki/wiki_helpers.py get_wiki_name("battle_pages", ...): the page uploader.py uploads that file to (and
//     patch_notes.py links to): "_(Main_Quest)" / "_(Event)" on names shared with a main story / portrait page, then
//     "/Detailed Battle Info", "/Stages" (Heartphial Quests, Link Raid, Exedra Crisis) or nothing (Score Attack,
//     Chaos Mode, Upgrade Quests, Mirror Layers).
// Keep this in step with both when their naming changes.
import cardJson from "../assets/base_data/getCardMstList.json"
import questGroupJson from "../assets/base_data/getQuestGroupMstList.json"
import questStageJson from "../assets/base_data/getQuestStageMstList.json"
import soloRaidJson from "../assets/base_data/getSoloRaidMstList.json"
import multiRaidJson from "../assets/base_data/getMultiRaidMstList.json"

const WIKI = "https://exedra.wiki/wiki/"
const THEMED_TOWER_TAB_NAMES: Record<number, string> = { 502: "Magical Girl Tower" }

const groups = new Map<number, any>((questGroupJson as any[]).map(g => [g.questGroupMstId, g]))
const stagesByGroup = new Map<number, any[]>()
for (const s of questStageJson as any[]) {
    const list = stagesByGroup.get(s.questGroupMstId)
    if (list) list.push(s); else stagesByGroup.set(s.questGroupMstId, [s])
}
const stageById = new Map<number, any>((questStageJson as any[]).map(s => [s.questStageMstId, s]))
// keyed like the generator's dicts: the last row of a key wins
const crisisSeason = new Map<number, any>((soloRaidJson as any[]).map(r => [r.soloRaidMstId, r]))
const raidSeason = new Map<number, any>((multiRaidJson as any[]).map(r => [r.seasonId, r]))
// start time -> names of the quest groups starting then (Score Attack pages take their event's name)
const startDates = new Map<string, string[]>()
for (const g of questGroupJson as any[]) {
    if (g.name.includes("_Score Attack")) continue
    const list = startDates.get(g.startTime)
    if (list) list.push(g.name); else startDates.set(g.startTime, [g.name])
}

/** The wiki page name of a quest group as generate() names it (before the per-category changes). */
function basePath(group: any): string {
    let path: string = group.name
    if (path === "For Score Attack Part II") path = "Farewell Story Part II_Score Attack"
    if (path.includes("_Score Attack")) {
        const base = path.replace(/_Score Attack$/, "")
        for (const n of startDates.get(group.startTime) ?? []) if (n.includes(base)) path = `${n}_Score Attack`
    }
    if (path.startsWith("Magic Unlock") || path.startsWith("Crystalis Quest"))
        path = `Upgrade Quests/${path.replace(/:/g, "").replace(/Unlock Material /g, "")}`
    if (path === "Kioku Upgrade Material Quest") path = "Upgrade Quests/Kioku Upgrade Quest"
    path = path.replace(/_Score Attack/g, "/Score Attack").replace(/_Chaos/g, "/Chaos Mode")
    if (path === "Rose Garden Witch/Chaos Mode") path = "Rose Garden Witch Part I/Chaos Mode"
    return path
}

/** wiki_helpers.wikify_name, minus the file-name-only escapes get_wiki_name undoes (":" "/"); "?" is kept as is. */
function wikify(name: string): string {
    return name.replace(/\.$/, "").replace(/ /g, "_").replace(/>/g, "≻").replace(/[[\]]/g, "")
}

// get_wiki_name's main_story_stages (wiki/story_pages/en-Latn/Main Stories): the main story quests' names
const mainStoryNames = new Set<string>((questGroupJson as any[])
    .filter(g => g.questCategoryMstId === 1 && !g.name.includes("_Chaos")).map(g => wikify(g.name)))
// get_wiki_name's portrait_pages (generator_portrait_pages.py generate(), with its "_(Portrait)" renames)
const portraitNames = new Set<string>((cardJson as any[]).map(c => {
    const f = wikify(String(c.name).replace(/\//g, " "))
    return f.endsWith("Witch") || f.endsWith("Witch_Minion") || f.startsWith("Uwasa_of_the") || f.startsWith("Witch_of")
        || f === "Crépuscule_de_la_Reine" ? `${f}_(Portrait)` : f
}))

/** wiki_helpers.get_wiki_name for a battle_pages file (`name` already wikified): the page it is uploaded to. */
function wikiName(name: string): string {
    const cut = name.indexOf("/")
    let root = cut < 0 ? name : name.slice(0, cut)
    const other = cut < 0 ? "" : name.slice(cut + 1)
    if (mainStoryNames.has(root) && !(root.includes("_Part_I") || root.includes("'s_Memory"))) root = `${root}_(Main_Quest)`
    else if (portraitNames.has(root)) root = `${root}_(Event)`
    if (root === "Mirror_Layers" || root.includes("Upgrade_Quests")) return name
    const sub = other ? `/${other}` : ""
    if (root === "Heartphial_Quests" || root.includes("Link_Raid") || root.includes("Exedra_Crisis")) return `${root}${sub}/Stages`
    if (other.includes("Chaos_Mode") || other.includes("Score_Attack")) return `${root}/${other}`
    return `${root}${sub}/Detailed_Battle_Info`
}

/** The wiki page (title, "/" for subpages) with the stage, or undefined when the wiki has no battle page for it. */
export function wikiBattlePage(stageId: number): string | undefined {
    const file = generatorPage(stageId)
    return file === undefined ? undefined : wikiName(wikify(file))
}

/** The page generate() writes the stage's file for (before wikify_name). */
function generatorPage(stageId: number): string | undefined {
    const stage = stageById.get(stageId)
    const group = stage ? groups.get(stage.questGroupMstId) : undefined
    if (!group) return undefined
    const cat = group.questCategoryMstId
    if (cat === 15) {
        // themed towers are a tab of the Tower page
        const tower = (questGroupJson as any[]).find(g => g.questCategoryMstId === 5)
        return tower ? `${basePath(tower)}/${THEMED_TOWER_TAB_NAMES[group.questGroupMstId] ?? group.name}` : undefined
    }
    if (cat === 5) {
        // 50 stages per tab, in data order
        const n = (stagesByGroup.get(group.questGroupMstId) ?? []).findIndex(s => s.questStageMstId === stageId)
        const from = Math.floor(Math.max(0, n) / 50) * 50 + 1
        return `${basePath(group)}/${from}-${from + 49}`
    }
    if (cat === 14) {
        const date = crisisSeason.get(group.questGroupMstId - 3000)?.startTime?.slice(0, 10)
        return date ? `Exedra Crisis/${date}` : undefined
    }
    if (cat === 12) {
        const date = raidSeason.get(group.questGroupMstId - 2000)?.startTime?.slice(0, 10)
        return date ? `Link Raid/${date}` : undefined
    }
    if ([1, 4, 9, 10, 11, 13].includes(cat)) return basePath(group)
    return undefined // tutorial and categories the wiki has no battle pages for
}

/** exedra.wiki URL of the stage's battle page. */
export function wikiBattleUrl(stageId: number): string | undefined {
    const page = wikiBattlePage(stageId)
    if (!page) return undefined
    const encode = (seg: string) => encodeURIComponent(seg).replace(/%3A/g, ":").replace(/%2C/g, ",")
    return WIKI + page.split("/").map(encode).join("/")
}
