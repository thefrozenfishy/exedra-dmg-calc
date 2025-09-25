<template>
    <div class="add-user">
        <h2>Link Raid Automation</h2>
        <p>This tool helps automate Link Raid battles download it <a href="https://github.com/thefrozenfishy/exedra-link-raid-automation">here</a></p>
        <p>If you wish to add yourself to the community priority list add yourself to the list here</p>
        <form @submit.prevent="submitUsername" class="form">
            <input v-model="username" placeholder="Enter your username" required />
            <button type="submit" :disabled="loading">Submit</button>
        </form>

        <p v-if="message" :class="status">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref } from "vue";

const username = ref("");
const message = ref("");
const status = ref("");
const loading = ref(false);

async function submitUsername() {
    message.value = "";
    status.value = "";
    loading.value = true;

    try {
        const res = await fetch(
            "https://api.github.com/repos/thefrozenfishy/exedra-link-raid-automation/actions/workflows/add-user.yml/dispatches",
            {
                method: "POST",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                },
                body: JSON.stringify({
                    ref: "main",
                    inputs: { username: username.value },
                }),
            }
        );

        if (res.ok) {
            message.value = `✅ Successfully requested to add "${username.value}"!`;
            status.value = "success";
            username.value = "";
        } else {
            const text = await res.text();
            message.value = `❌ Failed: ${res.status} – ${text}`;
            status.value = "error";
        }
    } catch (err) {
        message.value = `❌ Error: ${err.message}`;
        status.value = "error";
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.add-user {
    max-width: 400px;
    margin: 1em auto;
    text-align: center;
}

.form {
    display: flex;
    gap: 0.5em;
    justify-content: center;
}

input {
    flex: 1;
    padding: 0.5em;
}

button {
    padding: 0.5em 1em;
}

.success {
    color: green;
}

.error {
    color: red;
}
</style>
