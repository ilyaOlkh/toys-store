import { products, types } from "@prisma/client";
import { ProductType } from "../types/types";
export const dynamic = "force-dynamic";

export async function fetchTypes(): Promise<types[]> {
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/api/types"
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchProduct(id: number): Promise<products | null> {
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/api/products/" + id
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function fetchProducts(): Promise<ProductType[]> {
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/api/products"
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchProductsByIds(
    ids: number[]
): Promise<ProductType[]> {
    if (ids.length === 0) {
        console.error("No IDs provided");
        return [];
    }

    const idsString = ids.join(",");

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/ids?ids=${idsString}`
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchUserRoles(userId: string): Promise<any> {
    try {
        const response = await fetch(
            `${process.env.URL}/api/user/roles?userId=${encodeURIComponent(
                userId
            )}`, // Добавляем userId в строку запроса
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw "Failed to fetch user roles";
        }

        const data = await response.json();

        return data.roles;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        throw error;
    }
}
