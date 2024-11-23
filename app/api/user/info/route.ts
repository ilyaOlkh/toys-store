// app/api/user/info/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";
export const fetchCache = "force-cache";

async function getMachineToMachineToken() {
    const response = await axios.post(
        `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
        {
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
            grant_type: "client_credentials",
        }
    );

    return response.data.access_token;
}

async function fetchUserInfo(
    userId: string,
    domain: string,
    accessToken: string
) {
    const response = await fetch(`${domain}/api/v2/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
        next: { revalidate: 10 }, // кэш на час для каждого отдельного пользователя
    });

    const data = await response.json();

    return {
        user_id: data.user_id,
        name: data.name || data.nickname,
        picture: data.picture,
    };
}

export async function GET(request: NextRequest) {
    try {
        const domain = process.env.AUTH0_ISSUER_BASE_URL;

        // Получаем access token для обращения к API Auth0
        const accessToken = await getMachineToMachineToken();

        // Получаем userIds из строки запроса
        const { searchParams } = new URL(request.url);
        const userIds = searchParams.get("userIds");

        if (!userIds) {
            return NextResponse.json(
                { message: "User IDs are required" },
                { status: 400 }
            );
        }

        if (!domain || !accessToken) {
            return NextResponse.json(
                { message: "Environment variables not set" },
                { status: 500 }
            );
        }

        // Преобразуем строку userIds в массив
        const userIdArray = userIds.split(",");

        // Получаем информацию о каждом пользователе
        const userPromises = userIdArray.map((userId) =>
            fetchUserInfo(userId, domain, accessToken)
        );

        const users = await Promise.all(userPromises);

        return NextResponse.json({
            message: "User info retrieved successfully",
            users,
        });
    } catch (error) {
        console.error("Error retrieving user info:", error);
        return NextResponse.json(
            { message: "Error retrieving user info" },
            { status: 500 }
        );
    }
}
