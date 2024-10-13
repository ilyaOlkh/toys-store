// store.ts
import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./modalSlice";
import userReducer from "./userSlice";
import favoritesReducer from "./favoritesSlice";
import cartReducer from "./cartSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            modal: modalReducer,
            user: userReducer,
            favorites: favoritesReducer,
            cart: cartReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
