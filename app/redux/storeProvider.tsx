"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { setUser } from "./userSlice"; // Экшен для установки пользователя

export default function StoreProvider({
    initialUser,
    children,
}: {
    initialUser: any; // Тип данных пользователя, возможно, Claims | null
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
        storeRef.current.dispatch(setUser(initialUser)); // Устанавливаем пользователя в стор
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
