// "use client";
import { getSession } from "@auth0/nextjs-auth0";
import { cart, favorites } from "@prisma/client";
import { ModalType, modalTypes } from "../constants/modal-constants";
import { getFavorites } from "../utils/fetchFavorites";
import { getCart } from "../utils/fetchCart";

export async function initState() {
    const session = await getSession();
    const initialUser = session ? session.user : null;

    let favorites: favorites[] | undefined;
    let cartItems: cart[] | undefined;
    if (initialUser) {
        favorites = await getFavorites(initialUser.sub);
        cartItems = await getCart(initialUser.sub);
    }

    // null
    const initialHash =
        typeof window !== "undefined" && window.location.hash
            ? window.location.hash.substring(1)
            : null;
    const validHashArr = Object.values(modalTypes) as string[];
    const initialModalHash = (
        validHashArr.includes(initialHash ?? "") ? initialHash : null
    ) as ModalType;

    return {
        initialUser,
        favorites,
        cartItems,
        initialModalHash,
    };
}
