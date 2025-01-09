// utils/sendOrder.ts
import { clearCartThunk } from "../redux/cartSlice";
import { AppDispatch } from "../redux/store";
import { OrderCreateInput } from "../constants/orderConstants";

const redirectUrl = "/";

export async function sendOrder(
    orderData: OrderCreateInput,
    dispatch: AppDispatch
) {
    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error("Failed to create order");
        }

        // Очищаем корзину после успешного создания заказа
        await dispatch(clearCartThunk());

        // Перенаправляем на главную страницу
        window.location.href = redirectUrl;

        return true;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}
