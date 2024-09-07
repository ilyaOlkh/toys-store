import { configureStore } from '@reduxjs/toolkit';
import headerReducer from './headerSlice'; // импортируйте редюсер для хедера меню

const store = configureStore({
    reducer: {
        header: headerReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;