import { cart, products } from "@prisma/client";
import { ProductType } from "../types/types";

// Интерфейс для элемента корзины с продуктом
interface CartItemWithProduct extends cart {
    product: ProductType;
}

// Получение всех товаров в корзине
export async function getCartItems(
    userIdentifier: string
): Promise<CartItemWithProduct[]> {
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

// Добавление товара в корзину
export async function addToCart(
    userIdentifier: string,
    productId: number,
    quantity: number
): Promise<CartItemWithProduct> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_identifier: userIdentifier,
                    product_id: productId,
                    quantity,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to add item to cart");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
    }
}

// Обновление количества товара в корзине
export async function updateCartItemQuantity(
    cartItemId: number,
    quantity: number
): Promise<CartItemWithProduct> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartItemId,
                    quantity,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update cart item quantity");
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        throw error;
    }
}

// Удаление отдельного товара из корзины
export async function removeFromCart(
    cartItemId: number
): Promise<{ message: string }> {
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
            throw new Error("Failed to remove item from cart");
        }
        return await response.json();
    } catch (error) {
        console.error("Error removing item from cart:", error);
        throw error;
    }
}

// Очистка всей корзины пользователя
export async function clearCart(
    userIdentifier: string
): Promise<{ message: string }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_identifier: userIdentifier }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear cart");
        }
        return await response.json();
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}

export function calculateCartTotal(cartItems: CartItemWithProduct[]): number {
    return cartItems.reduce((total, item) => {
        const price = item.product.discount || item.product.price;
        return total + price * item.quantity;
    }, 0);
}

export function calculateTotalItems(cartItems: CartItemWithProduct[]): number {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
}
