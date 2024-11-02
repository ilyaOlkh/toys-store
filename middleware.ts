// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Клонируем ответ
    const response = NextResponse.next();

    // Получаем существующую куку
    const cookie = request.cookies.get("appSession");
    console.log(cookie);
    if (cookie) {
        // Устанавливаем куку заново с нужными параметрами
        response.cookies.set({
            name: "appSession",
            value: cookie.value,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
    }

    return response;
}

export const config = {
    matcher: "/api/:path*",
};
