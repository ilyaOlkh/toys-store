import { getSession } from "@auth0/nextjs-auth0";
import { redirect, RedirectType } from "next/navigation";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/", RedirectType.replace);
    }
    return <>{children}</>;
}
