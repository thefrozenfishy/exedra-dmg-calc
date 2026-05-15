<template>
    <div class="fpb-wrapper" ref="wrapperRef">
        <button class="friend-avatar-wrapper"
            :class="[side === 'left' ? 'side-left' : 'side-right', { 'is-open': open, 'is-placeholder': !currentCode }]"
            @click="toggle" :title="currentCode ? `Click to change (${currentCode})` : 'Click to select an account'">
            <img class="profile-avatar" :src="avatarSrc" />
            <span class="badge-name">{{ displayLabel }}</span>
            <span class="badge-chevron" :class="{ 'open': open }">▾</span>
        </button>

        <transition name="picker-drop">
            <div v-if="open" class="fpb-dropdown" :class="side">
                <div class="fpb-search-row">
                    <input ref="searchInputRef" v-model="query" class="fpb-search" placeholder="Name, nickname or code…"
                        @keydown.escape="open = false" @keydown.enter.prevent="onEnter"
                        @keydown.arrow-down.prevent="moveCursor(1)" @keydown.arrow-up.prevent="moveCursor(-1)"
                        spellcheck="false" autocomplete="off" />
                </div>

                <div class="fpb-list" ref="listRef">
                    <template v-if="selfVisible && selfProfile">
                        <div class="fpb-section-label">You</div>

                        <button class="fpb-option fpb-self" :class="{ 'fpb-active': cursor === 0 }"
                            @click="pick(selfProfile.friend_id)" @mouseenter="cursor = 0">
                            <img class="fpb-opt-avatar fpb-self-avatar"
                                :src="kiokuThumb(selfProfile.profile_icon || 10010101)" />

                            <div class="fpb-opt-info">
                                <span class="fpb-opt-name">
                                    {{
                                        selfProfile.display_name?.trim() ||
                                        selfProfile.friend_id
                                    }}

                                    <span class="fpb-you-tag">
                                        you
                                    </span>
                                </span>

                                <span class="fpb-opt-code">
                                    {{ selfProfile.friend_id }}
                                </span>
                            </div>
                        </button>
                    </template>

                    <template v-if="filteredFriends.length">
                        <div class="fpb-section-label">Friends</div>
                        <button v-for="(f, i) in filteredFriends" :key="f.friend_id" class="fpb-option"
                            :class="{ 'fpb-active': cursor === selfOffset + i, 'fpb-union': f.isUnionMember }"
                            @click="pick(f.friend_id)" @mouseenter="cursor = selfOffset + i">
                            <img class="fpb-opt-avatar" :src="kiokuThumb(f.profile_icon || 10010101)" />
                            <div class="fpb-opt-info">
                                <span class="fpb-opt-name">
                                    {{ f.nickname?.trim() || f.display_name?.trim() || f.friend_id }}
                                    <span v-if="f.favorite" class="fpb-star">★</span>
                                    <span v-if="f.isUnionMember" class="fpb-union-tag">union</span>
                                </span>
                                <span v-if="f.nickname?.trim() && f.display_name?.trim()" class="fpb-opt-sub">{{
                                    f.display_name }}</span>
                                <span class="fpb-opt-code">{{ f.friend_id }}</span>
                            </div>
                        </button>
                    </template>

                    <template v-if="queryLooksLikeCode && !exactMatch">
                        <div class="fpb-section-label">Direct entry</div>
                        <button class="fpb-option"
                            :class="{ 'fpb-active': cursor === selfOffset + filteredFriends.length }"
                            @click="pick(query.toUpperCase())"
                            @mouseenter="cursor = selfOffset + filteredFriends.length">
                            <div class="fpb-opt-code-icon">🔍</div>
                            <div class="fpb-opt-info">
                                <span class="fpb-opt-name">Load <strong>{{ query.toUpperCase() }}</strong></span>
                                <span class="fpb-opt-sub">Friend code lookup</span>
                            </div>
                        </button>
                    </template>

                    <div v-if="!selfVisible && filteredFriends.length === 0 && !queryLooksLikeCode" class="fpb-empty">
                        {{ query.length ? 'No matches — type a 5-char code to load directly' : 'No friends yet' }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
} from "vue"

import {
    useFriendStore,
    type SocialProfile,
} from "../store/friendStore"

const props = withDefaults(defineProps<{
    side: "left" | "right"
    currentCode: string | null
    hideSelf?: boolean
    placeholder?: string
}>(), {
    hideSelf: false,
})

const emit = defineEmits<{
    (e: "pick", code: string): void
}>()

const store = useFriendStore()

const open = ref(false)
const query = ref("")
const cursor = ref(0)

const wrapperRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const kiokuThumb = (id: number) =>
    `/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`

const normalise = (s: string) =>
    s.toLowerCase().trim()

const selfProfile = computed<SocialProfile | null>(() => {
    if (!store.friendCode) return null

    return {
        friend_id: store.friendCode,
        display_name: store.displayName,
        union_name: store.unionName,
        profile_icon: store.profile_icon,
    }
})

const currentProfile = computed(() => {
    if (!props.currentCode) return null

    if (props.currentCode === store.friendCode) {
        return selfProfile.value
    }

    return (
        store.friends.find(
            f => f.friend_id === props.currentCode
        ) ?? null
    )
})

const avatarSrc = computed(() =>
    kiokuThumb(
        currentProfile.value?.profile_icon || 10010101
    )
)

const displayLabel = computed(() => {
    if (!props.currentCode) {
        return props.placeholder ?? "Select…"
    }

    return (
        currentProfile.value?.display_name?.trim() ||
        currentProfile.value?.nickname?.trim() ||
        props.currentCode
    )
})

const selfVisible = computed(() => {
    if (props.hideSelf) return false
    const self = selfProfile.value

    if (!self?.friend_id) return false

    const q = normalise(query.value)

    if (!q) return true

    return (
        normalise(self.friend_id).includes(q) ||
        normalise(self.display_name ?? "").includes(q)
    )
})

const selfOffset = computed(() =>
    selfVisible.value ? 1 : 0
)

const filteredFriends = computed(() => {
    const q = normalise(query.value)

    const base = q
        ? store.friends.filter(f =>
            normalise(f.friend_id).includes(q) ||
            normalise(f.display_name ?? "").includes(q) ||
            normalise(f.nickname ?? "").includes(q)
        )
        : [...store.friends]

    base.sort((a, b) => {
        if (!!a.favorite !== !!b.favorite) {
            return a.favorite ? -1 : 1
        }

        if (
            !!a.isUnionMember !==
            !!b.isUnionMember
        ) {
            return a.isUnionMember ? -1 : 1
        }

        return (
            a.nickname ||
            a.display_name ||
            ""
        ).localeCompare(
            b.nickname ||
            b.display_name ||
            ""
        )
    })

    return base
})

const queryLooksLikeCode = computed(() => query.value.trim().length == 5)

const exactMatch = computed(() => {
    const q = normalise(query.value)

    return store.friends.some(f => normalise(f.friend_id) === q) || normalise(store.friendCode) === q
})

const totalOptions = computed(() =>
    selfOffset.value +
    filteredFriends.value.length +
    (
        queryLooksLikeCode.value && !exactMatch.value ? 1 : 0
    )
)

const toggle = () => {
    open.value = !open.value

    if (!open.value) return

    query.value = ""
    cursor.value = 0

    nextTick(() => { searchInputRef.value?.focus() })
}

const pick = (code: string) => {
    open.value = false
    query.value = ""

    emit("pick", code.toUpperCase())
}

const moveCursor = (dir: number) => {
    cursor.value = (cursor.value + dir + totalOptions.value) % totalOptions.value

    nextTick(() => {
        const active = listRef.value?.querySelector(".fpb-active") as HTMLElement | null
        active?.scrollIntoView({ block: "nearest" })
    })
}

const onEnter = () => {
    if (selfVisible.value &&
        cursor.value === 0 &&
        selfProfile.value) {
        pick(selfProfile.value.friend_id)
        return
    }

    if (cursor.value <
        selfOffset.value +
        filteredFriends.value.length) {
        pick(
            filteredFriends.value[
                cursor.value -
                selfOffset.value
            ].friend_id
        )

        return
    }

    if (queryLooksLikeCode.value && !exactMatch.value) {
        pick(query.value.toUpperCase())
    }
}

const handleClickOutside = (e: MouseEvent) => {
    if (
        wrapperRef.value &&
        !wrapperRef.value.contains(
            e.target as Node
        )
    ) {
        open.value = false
    }
}

watch(query, () => { cursor.value = 0 })

onMounted(() => { document.addEventListener("mousedown", handleClickOutside) })

onBeforeUnmount(() => { document.removeEventListener("mousedown", handleClickOutside) })
</script>

<style scoped>
.fpb-wrapper {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
}

.friend-avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 0.55rem;

    background: #2b2b2b;
    border: 1px solid #444;
    border-radius: 999px;
    padding: 0.35rem 0.75rem 0.35rem 0.45rem;

    cursor: pointer;
    color: #ddd;

    transition:
        background 0.15s,
        border-color 0.15s,
        box-shadow 0.15s;
}

.friend-avatar-wrapper:hover,
.friend-avatar-wrapper.is-open {
    background: #333;
    border-color: #666;
    box-shadow: 0 0 0 2px rgba(142, 91, 199, 0.35);
}

.friend-avatar-wrapper.is-placeholder {
    border-style: dashed;
    opacity: 0.75;
}

.profile-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #666;
    background: #111;
    flex-shrink: 0;
}

.badge-name {
    font-weight: bold;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.95rem;
}

.side-left .badge-name {
    color: #90caf9;
}

.side-right .badge-name {
    color: #ffab91;
}

.badge-chevron {
    font-size: 0.75rem;
    opacity: 0.6;
    transition: transform 0.18s ease;
    margin-left: 0.15rem;
}

.badge-chevron.open {
    transform: rotate(180deg);
}

.fpb-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    z-index: 200;

    width: 300px;

    background: #1a1a1a;
    border: 1px solid #555;
    border-radius: 14px;

    box-shadow:
        0 12px 36px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.04);

    overflow: hidden;
}

.fpb-dropdown.left {
    left: 0;
}

.fpb-dropdown.right {
    right: 0;
}

.fpb-search-row {
    padding: 0.6rem 0.7rem 0.4rem;
    border-bottom: 1px solid #333;
}

.fpb-search {
    width: 100%;
    box-sizing: border-box;
    background: #111;
    border: 1px solid #555;
    border-radius: 8px;
    color: #eee;
    padding: 0.45rem 0.65rem;
    font-size: 0.88rem;
    outline: none;
    transition: border-color 0.15s;
}

.fpb-search:focus {
    border-color: #8e5bc7;
}

.fpb-list {
    max-height: 260px;
    overflow-y: auto;
    padding: 0.35rem 0;
}

.fpb-section-label {
    padding: 0.25rem 0.9rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #777;
}

.fpb-option {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    width: 100%;
    text-align: left;

    padding: 0.45rem 0.9rem;

    background: transparent;
    border: none;
    color: #ddd;
    cursor: pointer;

    transition: background 0.1s;
}

.fpb-option:hover,
.fpb-option.fpb-active {
    background: #2a2a2a;
}

.fpb-opt-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #555;
    flex-shrink: 0;
}

.fpb-opt-code-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.fpb-opt-info {
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
    min-width: 0;
}

.fpb-opt-name {
    font-size: 0.88rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fpb-opt-sub {
    font-size: 0.72rem;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fpb-opt-code {
    font-size: 0.7rem;
    color: #8e5bc7;
    font-family: monospace;
    letter-spacing: 0.05em;
}

.fpb-empty {
    padding: 0.7rem 0.9rem;
    font-size: 0.82rem;
    color: #666;
    text-align: center;
}

.fpb-self .fpb-self-avatar {
    border-color: #8e5bc7;
}

.fpb-you-tag {
    display: inline-block;
    margin-left: 0.3rem;
    padding: 0 0.35rem;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: #3a2f47;
    border: 1px solid #8e5bc7;
    border-radius: 999px;
    color: #c9a0e8;
    vertical-align: middle;
}

.fpb-star {
    color: #ffd66b;
    font-size: 0.8rem;
    margin-left: 0.2rem;
    vertical-align: middle;
}

.fpb-union-tag {
    display: inline-block;
    margin-left: 0.3rem;
    padding: 0 0.35rem;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: #1e2d40;
    border: 1px solid #3f5d8a;
    border-radius: 999px;
    color: #7aaddc;
    vertical-align: middle;
}

.fpb-union {
    border-left: 2px solid #3f5d8a;
}

.picker-drop-enter-active,
.picker-drop-leave-active {
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}

.picker-drop-enter-from,
.picker-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
}

@media (max-width: 700px) {
    .fpb-dropdown {
        width: 260px;
    }

    .badge-name {
        max-width: 110px;
    }

    .profile-avatar {
        width: 34px;
        height: 34px;
    }
}
</style>
