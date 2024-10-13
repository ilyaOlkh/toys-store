// storeProvider.tsx
"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { setUser } from "./userSlice"; // Экшен для установки пользователя
import { setCartItems } from "./cartSlice";
import { setFavorites, setProductsState } from "./favoritesSlice";
import { Claims } from "@auth0/nextjs-auth0";
import { cart, favorites } from "@prisma/client";
import { ModalType, modalTypes } from "../constants/modal-constants";
import { initModalFromHash } from "./modalSlice";
import { ProductType } from "../types/types";
import { fetchProductsByIds } from "../utils/fetch";

export default function StoreProvider({
    initialUser,
    favorites,
    favoritesProducts,
    cartItems,
    children,
}: {
    initialUser: Claims | null;
    favorites: favorites[] | undefined;
    favoritesProducts: ProductType[] | undefined;
    cartItems: cart[] | undefined;
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();

        initializeUser(storeRef.current, initialUser);
        initializeFavorites(storeRef.current, favorites, favoritesProducts);
        initializeCart(storeRef.current, cartItems);
        initializeModal(storeRef.current);
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}

function initializeUser(store: AppStore, initialUser: Claims | null) {
    store.dispatch(setUser(initialUser));
}

function initializeFavorites(
    store: AppStore,
    favorites: favorites[] | undefined,
    favoritesProducts: ProductType[] | undefined
) {
    const favoritesArr =
        favorites ?? JSON.parse(localStorage.getItem("favoritesToys") ?? "[]");
    store.dispatch(
        setFavorites({
            favoriteItems: favoritesArr,
            favoriteProducts: favoritesProducts,
        })
    );
    // if (favoritesProducts) {
    //     store.dispatch(setProductsState(favoritesProducts));
    // } else {
    //     const ids = favoritesArr.map((item: favorites) => item.product_id);
    //     const favoritesProducts = favorites
    //         ? await fetchProductsByIds(ids ?? [])
    //         : undefined;
    // }
}

function initializeCart(store: AppStore, cartItems: cart[] | undefined) {
    store.dispatch(
        setCartItems(
            cartItems ?? JSON.parse(localStorage.getItem("cartToys") ?? "[]")
        )
    );
}

function initializeModal(store: AppStore) {
    const initialHash =
        typeof window !== "undefined" && window.location.hash
            ? window.location.hash.substring(1)
            : null;
    const validHashArr = Object.values(modalTypes) as string[];
    const validHash = (
        validHashArr.includes(initialHash ?? "") ? initialHash : null
    ) as ModalType;

    store.dispatch(initModalFromHash(validHash));
}
