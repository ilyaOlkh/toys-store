import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import StoreProvider from "./redux/storeProvider";
import { Fragment } from "react";
import { getSession } from "@auth0/nextjs-auth0";
import { getFavorites } from "./utils/fetchFavorites";
import { getCartItems } from "./utils/fetchCart";
import { cart, favorites } from "@prisma/client";
import AppProvider from "./appComponents/appProvider";
import AppModals from "./appComponents/appModals";
import { ModalType, modalTypes } from "./constants/modal-constants";
import { fetchProductsByIds, fetchUserRoles } from "./utils/fetch";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession();
    const initialUser = session ? session.user : null;

    // Получаем роли пользователя, если он авторизован
    let userRoles = null;
    if (initialUser) {
        userRoles = await fetchUserRoles(initialUser.sub);
    }

    let favorites;
    let cartItems;
    if (initialUser) {
        favorites = await getFavorites(initialUser.sub);
        cartItems = await getCartItems(initialUser.sub);
    }

    const favoritesIds = favorites
        ? favorites.map((item) => item.product_id)
        : [];
    const favoritesProducts = favorites
        ? await fetchProductsByIds(favoritesIds)
        : undefined;

    const cartIds = cartItems ? cartItems.map((item) => item.product_id) : [];
    const cartProducts = cartItems
        ? await fetchProductsByIds(cartIds)
        : undefined;

    return (
        <html lang="en">
            <body className={comfortaa.className}>
                <AppProvider>
                    <StoreProvider
                        initialUser={initialUser}
                        favorites={favorites}
                        favoritesProducts={favoritesProducts}
                        cartItems={cartItems}
                        cartProducts={cartProducts}
                        userRoles={userRoles}
                    >
                        <Fragment>
                            <AppModals />
                            <Header />
                            {children}
                        </Fragment>
                    </StoreProvider>
                </AppProvider>
            </body>
        </html>
    );
}
