"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { selectActualItemQuantity } from "@/app/redux/cartSelectors";
import {
    addCartItem,
    removeCartItem,
    updateCartItem,
} from "@/app/redux/cartSlice";

export function ProductQuantityControl({
    productId,
    price,
}: {
    productId: number;
    price: number;
}) {
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);

    // Проверяем, есть ли товар в корзине
    const isInCart = useAppSelector((store) => {
        const isInCart = store.cart.cart.some(
            (item) => item.product_id === productId
        );
        const isInQueue = store.cart.queue.find(
            (item) => item.productId === productId
        );
        const isRemoveInQueue = store.cart.queue.find(
            (item) => item.productId === productId && item.type === "remove"
        );
        const isInNowPending = store.cart.nowPending.find(
            (item) => item.productId === productId
        );
        const isRemoveInNowPending = store.cart.nowPending.find(
            (item) => item.productId === productId && item.type === "remove"
        );

        return isInQueue
            ? isInQueue.type !== "remove" &&
                  !isRemoveInQueue &&
                  (isInQueue.type === "add" || isInQueue.type === "update")
            : isInNowPending
            ? isInNowPending.type !== "remove" &&
              !isRemoveInNowPending &&
              (isInNowPending.type === "add" ||
                  isInNowPending.type === "update")
            : isInCart;
    });

    // Получаем актуальное количество из корзины если товар там есть
    const cartQuantity = useAppSelector((state) =>
        selectActualItemQuantity(state, productId)
    );

    // Синхронизируем локальное состояние с корзиной
    useEffect(() => {
        if (isInCart) {
            setQuantity(cartQuantity);
        }
    }, [isInCart, cartQuantity]);

    // Обработка изменения количества
    const handleQuantityChange = (delta: number) => {
        const newQuantity = Math.max(
            1,
            isInCart ? cartQuantity + delta : quantity + delta
        );

        if (isInCart) {
            // Если товар в корзине, обновляем количество через redux
            dispatch(
                updateCartItem({
                    productId,
                    quantity: newQuantity,
                })
            );
        } else {
            // Если товар не в корзине, обновляем локальное состояние
            setQuantity(newQuantity);
        }
    };

    // Обработка добавления/удаления из корзины
    const handleCartAction = () => {
        if (isInCart) {
            dispatch(removeCartItem(productId));
        } else {
            console.log(quantity);
            dispatch(
                addCartItem({
                    product_id: productId,
                    quantity: quantity,
                })
            );
        }
    };

    return (
        <div className="flex gap-4 mt-4">
            {/* Контроль количества */}
            <div className="flex border border-[#E8E8E8] rounded-lg">
                <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 hover:bg-gray-50 text-xl font-medium"
                    disabled={isInCart ? cartQuantity === 1 : quantity === 1}
                >
                    -
                </button>
                <input
                    type="number"
                    className="w-16 text-center border-x border-[#E8E8E8]"
                    value={isInCart ? cartQuantity : quantity}
                    readOnly
                />
                <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 hover:bg-gray-50 text-xl font-medium"
                >
                    +
                </button>
            </div>

            {/* Кнопка добавления/удаления из корзины */}
            <button
                onClick={handleCartAction}
                className={`px-8 py-2 rounded-lg transition-colors ${
                    isInCart
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#0F83B2] hover:bg-[#0d7aa6] text-white"
                }`}
            >
                {isInCart ? "Remove from cart" : "Add to cart"}
            </button>
        </div>
    );
}
