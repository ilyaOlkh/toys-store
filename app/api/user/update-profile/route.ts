// app/api/user/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAccessToken, getSession, updateSession } from "@auth0/nextjs-auth0";

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

export async function PATCH(request: NextRequest, nextResponse: NextResponse) {
    try {
        // Получаем данные из запроса
        const { newPictureUrl } = await request.json();

        // Замените на ваш домен и токен
        const domain = process.env.AUTH0_ISSUER_BASE_URL;

        const accessToken = await getMachineToMachineToken();
        const userResponse = await getSession();
        const userId = userResponse?.user.sub;

        if (!domain || !accessToken) {
            return NextResponse.json(
                { message: "Environment variables not set" },
                { status: 500 }
            );
        }

        // Параметры запроса
        const options = {
            method: "PATCH",
            url: `${domain}/api/v2/users/${userId}`,
            headers: {
                Accept: "application/json",
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
            },
            data: { picture: newPictureUrl },
        };

        // Выполняем запрос к Auth0 API
        const response = await axios.request(options);
        const session = await getSession();
        if (session) {
            await updateSession({
                ...session,
                user: { ...session.user, picture: newPictureUrl },
            });
        }
        return NextResponse.json({
            message: "User picture updated successfully",
            data: response.data,
        });
    } catch (error) {
        console.error("Error updating user picture:", error);
        return NextResponse.json(
            { message: "Error updating user picture" },
            { status: 500 }
        );
    }
}
