import { NextRequest, NextResponse } from "next/server";
import { buildWhereConditions } from "@/lib/orders/filters";
import { buildOrderByConditions } from "@/lib/orders/sorts";
import { getFilteredOrders } from "@/lib/orders/getFilteredOrders";
import { Claims } from "@auth0/nextjs-auth0";
import axios from "axios";

async function isAdmin(userId: string) {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_URL}/api/user/roles?userId=${userId}`
        );
        return response.data.roles.some(
            (role: { name: string }) => role.name === "admin"
        );
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

async function getUserFromCookie(request: NextRequest): Promise<Claims | null> {
    try {
        console.log(request.cookies.get("appSession"));
        const appSession = request.cookies.get("appSession")?.value;

        if (!appSession) {
            return null;
        }

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_URL}/api/auth/me`,
            {
                headers: {
                    Cookie: `appSession=${appSession}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error getting user from cookie:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = JSON.parse(searchParams.get("filters") || "{}");
        const sort = JSON.parse(searchParams.get("sort") || "{}");
        const sortingRuleSet = JSON.parse(
            searchParams.get("sortingRuleSet") || '""'
        );

        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit")!)
            : undefined;
        const offset = searchParams.get("offset")
            ? parseInt(searchParams.get("offset")!)
            : undefined;

        // Проверяем сессию
        const session = await getUserFromCookie(request);
        console.log(session);

        // Если передан user_identifier в фильтрах
        if (filters.user_identifier) {
            // Проверяем, соответствует ли переданный идентификатор текущему пользователю
            if (!session || session.sub !== filters.user_identifier) {
                return NextResponse.json(
                    { error: "Unauthorized access to orders" },
                    { status: 403 }
                );
            }
        } else {
            // Если фильтр user_identifier не передан, проверяем права администратора
            if (!session) {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                );
            }

            const admin = await isAdmin(session.sub);
            if (!admin) {
                // Если не администратор, показываем только свои заказы
                filters.user_identifier = session.sub;
            }
        }

        // Build query conditions
        const [whereConditions, orderByConditions] = await Promise.all([
            buildWhereConditions(filters),
            buildOrderByConditions(sort, sortingRuleSet),
        ]);
        console.log(whereConditions);
        // Get filtered orders
        const { orders, total } = await getFilteredOrders({
            whereConditions,
            orderByConditions,
            limit,
            offset,
        });

        return NextResponse.json({
            orders,
            total,
            pagination: {
                limit,
                offset,
                currentCount: orders.length,
            },
        });
    } catch (error) {
        console.error("Error processing filtered orders request:", error);
        return NextResponse.json(
            { error: "Failed to fetch filtered orders" },
            { status: 500 }
        );
    }
}
