import { getSession } from "@auth0/nextjs-auth0";
import { redirect, RedirectType } from "next/navigation";
import { fetchUserRoles } from "../utils/fetch";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/", RedirectType.replace);
    }
    const userRoles = await fetchUserRoles(session.user.sub);
    const isAdmin =
        userRoles &&
        userRoles.some((role: { name: string }) => role.name === "admin");
    if (!isAdmin) {
        redirect("/", RedirectType.replace);
    }
    return <>{children}</>;
}
