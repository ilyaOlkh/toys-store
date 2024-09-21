import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const session = await getSession();

    if (!session) {
        return NextResponse.redirect(new URL("/api/auth/login", req.url));
    }
    const userRoles = session.user["https://your-app.com/roles"] || [];

    if (!userRoles.includes("admin")) {
        return NextResponse.redirect(new URL("/403", req.url));
    }

    return res;
}

export const config = {
    matcher: ["/needAdminAccess/:path*"],
};
