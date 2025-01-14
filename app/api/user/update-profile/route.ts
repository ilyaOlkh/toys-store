// app/api/user/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getSession, updateSession } from "@auth0/nextjs-auth0";

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

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json(
                { message: "User not authenticated" },
                { status: 401 }
            );
        }

        const userId = session.user.sub;
        const domain = process.env.AUTH0_ISSUER_BASE_URL;
        const accessToken = await getMachineToMachineToken();

        if (!domain || !accessToken) {
            return NextResponse.json(
                { message: "Environment variables not set" },
                { status: 500 }
            );
        }

        const updates = await request.json();

        const updateData: any = {
            given_name: session.user.given_name,
            family_name: session.user.family_name,
            nickname: session.user.nickname,
            name: session.user.name,
            picture: session.user.picture,
            user_metadata: {
                ...(session.user.user_metadata || {}),
            },
        };

        if (updates.picture) {
            updateData.picture = updates.picture;
        }
        if (updates.firstName) {
            updateData.given_name = updates.firstName;
        }
        if (updates.lastName) {
            updateData.family_name = updates.lastName;
        }

        if (updates.firstName || updates.lastName) {
            const newFirstName = updates.firstName || session.user.given_name;
            const newLastName = updates.lastName || session.user.family_name;
            updateData.name = `${newFirstName} ${newLastName}`;
        }

        if (updates.phone || updates.orderEmail) {
            updateData.user_metadata = {
                ...(session.user.user_metadata || {}),
                ...(updates.phone && { phone: updates.phone }),
                ...(updates.orderEmail && { orderEmail: updates.orderEmail }),
            };
        }

        const options = {
            method: "PATCH",
            url: `${domain}/api/v2/users/${userId}`,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            data: updateData,
        };

        const response = await axios.request(options);

        const updatedSession = {
            ...session,
            user: {
                ...session.user,
                ...updateData,
                user_metadata: updateData.user_metadata,
            },
        };

        await updateSession(updatedSession);

        return NextResponse.json({
            message: "User profile updated successfully",
            data: response.data,
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { message: "Error updating user profile" },
            { status: 500 }
        );
    }
}
