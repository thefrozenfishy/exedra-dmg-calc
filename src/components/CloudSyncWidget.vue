<template>
    <div class="cloud-sync-widget">
        <template v-if="userId">
            <div class="button-row">
                <button @click="copyFriendCode">
                    Friend Code: {{ friendCode }}
                </button>

                <transition name="slide-left">
                    <div v-if="expanded" class="expanded-buttons">
                        <button @click="copyUserId">
                            Copy Secret ID
                        </button>

                        <button @click="showRestore = true">
                            Load Profile
                        </button>
                    </div>
                </transition>

                <button class="expand-btn" @click="expanded = !expanded">
                    {{ expanded ? "‹" : "›" }}
                </button>
            </div>
        </template>

        <template v-else>
            <button @click="createAccount">
                Click to Sync Profile
            </button>

            <button @click="showRestore = true">
                Load Profile
            </button>
        </template>

        <div v-if="showRestore" class="restore-modal">
            <input v-model="restoreId" placeholder="Paste Secret Player ID" />

            <button @click="restoreAccount">
                Load
            </button>

            <button @click="showRestore = false">
                Cancel
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { useFriendStore } from "../store/friendStore"
import { toast } from "vue3-toastify"

const store = useCharacterStore()
const friendStore = useFriendStore()

const userId = computed(() => friendStore.userID)
const friendCode = computed(() => friendStore.friendCode)

const showRestore = ref(false)
const restoreId = ref("")
const expanded = ref(false)


const createAccount = async () => {
    try {
        await store.createCloudAccount()
        toast.success("Cloud sync enabled!", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
        window.location.reload()
    } catch (err) {
        console.error(err)

        toast.error("Failed to create cloud profile", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}

const copyFriendCode = async () => {
    if (!friendCode.value) return

    await navigator.clipboard.writeText(friendCode.value)

    toast.success(
        `Friend code copied: ${friendCode.value}`,
        {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        }
    )
}

const copyUserId = async () => {
    if (!userId.value) return

    await navigator.clipboard.writeText(userId.value)

    toast.warning(
        "Secret Player ID copied. DO NOT SHARE THIS.",
        {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
            autoClose: 5000,
        }
    )
}

const restoreAccount = async () => {
    try {
        await store.loadExistingCloudAccount(
            restoreId.value.trim()
        )
        toast.success("Profile loaded!", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
        window.location.reload()
    } catch (err) {
        console.error(err)

        toast.error("Failed to load profile", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}
</script>

<style scoped>
.cloud-sync-widget {
    position: fixed;
    top: 12px;
    right: 12px;

    display: flex;
    gap: 8px;

    z-index: 1000;
}

.cloud-sync-widget button {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--text);

    border-radius: 8px;

    padding: 0.45rem 0.75rem;

    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.cloud-sync-widget button:hover {
    background: rgba(255, 255, 255, 0.12);
}

.restore-modal {
    position: fixed;

    top: 60px;
    right: 12px;

    background: rgba(18, 13, 25, 0.96);

    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;

    padding: 12px;

    display: flex;
    flex-direction: column;
    gap: 8px;

    width: 280px;
}

.restore-modal input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text);

    padding: 0.5rem;
    border-radius: 8px;
}

.button-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.expanded-buttons {
    display: flex;
    gap: 8px;
    overflow: hidden;
}

.expand-btn {
    width: 32px;
    padding: 0.45rem 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>