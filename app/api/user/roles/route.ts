import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";

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

export async function GET(request: NextRequest) {
    try {
        const domain = process.env.AUTH0_ISSUER_BASE_URL;

        // Получаем access token для обращения к API Auth0
        const accessToken = await getMachineToMachineToken();

        // Получаем userId из строки запроса
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        if (!domain || !accessToken) {
            return NextResponse.json(
                { message: "Environment variables not set" },
                { status: 500 }
            );
        }

        // Параметры запроса
        const options = {
            method: "GET",
            url: `${domain}/api/v2/users/${userId}/roles`,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        };

        // Выполняем запрос к Auth0 API
        const response = await axios.request(options);
        return NextResponse.json({
            message: "User roles retrieved successfully",
            roles: response.data,
        });
    } catch (error) {
        console.error("Error retrieving user roles:", error);
        return NextResponse.json(
            { message: "Error retrieving user roles" },
            { status: 500 }
        );
    }
}
