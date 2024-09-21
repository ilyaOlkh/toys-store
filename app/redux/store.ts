import { configureStore } from "@reduxjs/toolkit";
import headerReducer from "./headerSlice"; // импортируйте редюсер для хедера меню
import userReducer from "./userSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            header: headerReducer,
            user: userReducer,
        },
    });
};

// Определяем типы стора и диспатча
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
