export async function fetchUsersInfo(userIds: string[]) {
    try {
        const response = await fetch(
            `/api/user/info?userIds=${userIds.join(",")}`,
            { method: "GET" }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return [];
    }
}
