// storeProvider.tsx
"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { setUser } from "./userSlice"; // Экшен для установки пользователя
import { setCartItems } from "./cartSlice";
import { setFavorites } from "./favoritesSlice";
import { Claims } from "@auth0/nextjs-auth0";
import { cart, favorites } from "@prisma/client";

export default function StoreProvider({
    initialUser,
    favorites,
    cartItems,
    children,
}: {
    initialUser: Claims | null; // Тип данных пользователя, возможно, Claims | null
    favorites: favorites[] | undefined; // Предварительно загруженные любимые товары
    cartItems: cart[] | undefined; // Предварительно загруженные товары в корзине
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
        storeRef.current.dispatch(setUser(initialUser)); // Устанавливаем пользователя в стор
        console.log(
            favorites ?? JSON.parse(localStorage.getItem("favorites") ?? "[]")
        );
        console.log(
            favorites ?? JSON.parse(localStorage.getItem("favorites") ?? "[]")
        );
        console.log(
            cartItems ?? JSON.parse(localStorage.getItem("cart") ?? "[]")
        );
        storeRef.current.dispatch(
            setFavorites(
                favorites ??
                    JSON.parse(localStorage.getItem("favoritesToys") ?? "[]")
            )
        ); // Загружаем любимые товары
        storeRef.current.dispatch(
            setCartItems(
                cartItems ??
                    JSON.parse(localStorage.getItem("cartToys") ?? "[]")
            )
        ); // Загружаем товары в корзине
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
