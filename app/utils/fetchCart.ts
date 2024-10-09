import { cart } from "@prisma/client";

export async function getCart(userIdentifier: string): Promise<cart[]> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart?user_identifier=${userIdentifier}`,
            { method: "GET" }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch cart items");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching cart items:", error);
        throw error;
    }
}

export async function addToCart(
    userIdentifier: string,
    productId: number,
    quantity: number
): Promise<cart> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_identifier: userIdentifier,
                    product_id: productId,
                    quantity: quantity,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to add to cart");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

type DeleteResponse = {
    success: boolean;
};

export async function removeFromCart(
    cartItemId: number
): Promise<DeleteResponse> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to remove cart item");
        }
        return await response.json();
    } catch (error) {
        console.error("Error removing cart item:", error);
        throw error;
    }
}
