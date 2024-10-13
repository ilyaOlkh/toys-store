import { favorites, products } from "@prisma/client";
import { ProductType } from "../types/types";

export async function getFavorites(
    userIdentifier: string
): Promise<favorites[]> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/favorites?user_identifier=${userIdentifier}`,
            { method: "GET" }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch favorites");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching favorites:", error);
        throw error;
    }
}
export async function addFavorite(
    userIdentifier: string,
    productId: number
): Promise<favorites & { product: ProductType }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_identifier: userIdentifier,
                    product_id: productId,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to add favorite");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding favorite:", error);
        throw error;
    }
}

type DeleteResponse = {
    success: boolean;
};

export async function removeFavorite(
    favoriteId: number
): Promise<DeleteResponse> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favoriteId }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to remove favorite");
        }
        return await response.json();
    } catch (error) {
        console.error("Error removing favorite:", error);
        throw error;
    }
}
