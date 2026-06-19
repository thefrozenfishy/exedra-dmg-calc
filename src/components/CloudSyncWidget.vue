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
                    {{ expanded ? "›" : "‹" }}
                </button>

                <div class="help-tooltip">
                    <button class="help-btn">?</button>

                    <div class="tooltip-content">
                        Your profile is stored in the cloud using a Secret Player ID.

                        <br><br>

                        Save this ID somewhere safe. It can be used to restore your profile
                        on another device or browser. 
                        You can load the same profile on multiple devices by using the same ID.

                        <br><br>

                        Anyone with this ID can access and edit your data. Do not share it publicly.
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <button @click="createAccount">
                Create New Profile
            </button>

            <button @click="showRestore = true">
                Load Existing Profile
            </button>

            <div class="help-tooltip">
                <button class="help-btn">?</button>

                <div class="tooltip-content">
                    Creating a cloud profile uploads all your kioku data and generates a Secret Player ID.

                    <br><br>

                    This ID is your recovery key. Save it somewhere safe. If you lose it contact TFF.

                    <br><br>

                    You can use it later with "Load Profile" to restore your data on
                    any device or browser.
                </div>
            </div>
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
        console.error("Failed to create cloud profile:", err)

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
        console.error("Failed to load profile:", err)

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

.help-tooltip {
    position: relative;
    display: flex;
    align-items: center;
}

.help-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    font-weight: bold;
}

.tooltip-content {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;

    width: 280px;

    padding: 12px;

    background: rgba(18, 13, 25, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;

    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.4;

    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);

    transition:
        opacity 0.15s ease,
        transform 0.15s ease,
        visibility 0.15s ease;

    pointer-events: none;

    z-index: 1001;
}

.help-tooltip:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
</style>