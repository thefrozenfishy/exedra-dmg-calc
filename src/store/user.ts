export function getUserId() {
    return localStorage.getItem("userId")
}

export function setUserId(userId: string) {
    localStorage.setItem("userId", userId)
}

export function createUserId() {
    const id = crypto.randomUUID()

    setUserId(id)

    return id
}