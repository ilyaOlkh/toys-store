import { UserInfo } from "../types/users";

export const dynamic = "force-dynamic";
export const fetchCache = "force-cache";

export async function fetchUsersInfo(userIds: string[]): Promise<UserInfo[]> {
    try {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_URL
            }/api/user/info?userIds=${userIds.join(",")}`,
            {
                method: "GET",
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
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
