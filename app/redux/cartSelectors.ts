import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { CartItem } from "./cartSlice";

// Базовые селекторы
const selectCart = (state: RootState) => state.cart.cart;
const selectCartProducts = (state: RootState) => state.cart.cartProducts;
const selectCartQueue = (state: RootState) => state.cart.queue;
const selectCartPending = (state: RootState) => state.cart.nowPending;

// Селектор для проверки, находится ли товар в процессе удаления
export const selectIsItemPendingRemoval = createSelector(
    [
        selectCartQueue,
        selectCartPending,
        (_state: RootState, productId: number) => productId,
    ],
    (queue, pending, productId) =>
        queue.some(
            (queueItem) =>
                queueItem.productId === productId && queueItem.type === "remove"
        ) ||
        pending.some(
            (pendingItem) =>
                pendingItem.productId === productId &&
                pendingItem.type === "remove"
        )
);

// Селектор для получения актуального количества товара
export const selectItemQuantity = createSelector(
    [
        selectCartQueue,
        selectCartPending,
        (_state: RootState, item: CartItem) => item,
    ],
    (queue, pending, item) => {
        const pendingUpdate = [...pending, ...queue].find(
            (pendingItem) =>
                pendingItem.productId === item.product_id &&
                pendingItem.type === "update"
        );
        return pendingUpdate?.quantity || item.quantity;
    }
);

export const selectCartTotals = createSelector(
    [selectCart, selectCartProducts, selectCartQueue, selectCartPending],
    (cart, products, queue, pending) => {
        return cart.reduce(
            (totals, cartItem) => {
                // Проверяем, не находится ли товар в процессе удаления
                const isPendingRemoval =
                    queue.some(
                        (queueItem) =>
                            queueItem.productId === cartItem.product_id &&
                            queueItem.type === "remove"
                    ) ||
                    pending.some(
                        (pendingItem) =>
                            pendingItem.productId === cartItem.product_id &&
                            pendingItem.type === "remove"
                    );

                if (isPendingRemoval) {
                    return totals;
                }

                // Находим информацию о продукте
                const product = products.find(
                    (p) => p.id === cartItem.product_id
                );

                if (product) {
                    // Получаем все обновления количества для данного товара
                    const updates = [...pending, ...queue]
                        .filter(
                            (item) =>
                                item.productId === cartItem.product_id &&
                                item.type === "update" &&
                                typeof item.quantity === "number"
                        )
                        .reverse(); // Разворачиваем массив, чтобы последние обновления были первыми

                    // Берем количество из последнего обновления или исходное количество
                    const quantity =
                        updates.length > 0
                            ? updates[0].quantity!
                            : cartItem.quantity;

                    // Рассчитываем стоимость
                    const originalPrice = Number(product.price) * quantity;
                    const discountedPrice = product.discount
                        ? Number(product.discount) * quantity
                        : originalPrice;

                    return {
                        totalOriginal: totals.totalOriginal + originalPrice,
                        totalWithDiscount:
                            totals.totalWithDiscount + discountedPrice,
                    };
                }

                return totals;
            },
            { totalOriginal: 0, totalWithDiscount: 0 }
        );
    }
);

// Селектор для проверки наличия добавляемых товаров
export const selectIsAddingItems = createSelector(
    [selectCartQueue, selectCartPending],
    (queue, pending) =>
        [...pending, ...queue].some((item) => item.type === "add")
);

// Селектор для получения активных товаров в корзине
export const selectActiveCartItems = createSelector(
    [selectCart, selectCartQueue, selectCartPending],
    (cart, queue, pending) =>
        cart.filter(
            (item) =>
                !queue.some(
                    (queueItem) =>
                        queueItem.productId === item.product_id &&
                        queueItem.type === "remove"
                ) &&
                !pending.some(
                    (pendingItem) =>
                        pendingItem.productId === item.product_id &&
                        pendingItem.type === "remove"
                )
        )
);

// Селектор для получения актуального количества конкретного товара
export const selectActualItemQuantity = createSelector(
    [
        (_state: RootState, productId: number) => productId,
        (state: RootState) => state.cart.queue,
        (state: RootState) => state.cart.nowPending,
        (state: RootState) => state.cart.cart,
    ],
    (productId, queue, pending, cart) => {
        // Проверяем очередь (наивысший приоритет)
        const queueItem = queue
            .slice()
            .reverse()
            .find(
                (item) =>
                    item.productId === productId &&
                    (item.type === "update" || item.type === "add") &&
                    item.quantity !== undefined
            );
        if (queueItem?.quantity !== undefined) {
            return queueItem.quantity;
        }

        // Проверяем pending (средний приоритет)
        const pendingItem = pending
            .slice()
            .reverse()
            .find(
                (item) =>
                    item.productId === productId &&
                    (item.type === "update" || item.type === "add") &&
                    item.quantity !== undefined
            );
        if (pendingItem?.quantity !== undefined) {
            return pendingItem.quantity;
        }

        // Возвращаем реальное количество (низший приоритет)
        const cartItem = cart.find((item) => item.product_id === productId);
        return cartItem?.quantity || 1;
    }
);

// Селектор для получения суммы всех количеств
export const selectTotalQuantity = createSelector(
    [
        (state: RootState) => state.cart.cart,
        (state: RootState) => state.cart.queue,
        (state: RootState) => state.cart.nowPending,
    ],
    (cart, queue, pending) => {
        return cart.reduce((total, cartItem) => {
            // Пропускаем товары, которые находятся в процессе удаления
            const isPendingRemoval =
                queue.some(
                    (queueItem) =>
                        queueItem.productId === cartItem.product_id &&
                        queueItem.type === "remove"
                ) ||
                pending.some(
                    (pendingItem) =>
                        pendingItem.productId === cartItem.product_id &&
                        pendingItem.type === "remove"
                );

            if (isPendingRemoval) {
                return total;
            }

            // Получаем актуальное количество для товара
            const queueItem = queue
                .slice()
                .reverse()
                .find(
                    (item) =>
                        item.productId === cartItem.product_id &&
                        item.type === "update" &&
                        item.quantity !== undefined
                );
            if (queueItem?.quantity !== undefined) {
                return total + queueItem.quantity;
            }

            const pendingItem = pending
                .slice()
                .reverse()
                .find(
                    (item) =>
                        item.productId === cartItem.product_id &&
                        item.type === "update" &&
                        item.quantity !== undefined
                );
            if (pendingItem?.quantity !== undefined) {
                return total + pendingItem.quantity;
            }

            return total + (cartItem.quantity || 1);
        }, 0);
    }
);
