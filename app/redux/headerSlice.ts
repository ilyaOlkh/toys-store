// headerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderState {
    menuOpen: boolean;
}

const initialState: HeaderState = {
    menuOpen: false,
};

const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {
        toggleMenu: (state) => {
            state.menuOpen = !state.menuOpen;
        },
        openMenu: (state) => {
            state.menuOpen = true;
        },
        closeMenu: (state) => {
            state.menuOpen = false;
        },
    },
});

export const { toggleMenu, openMenu, closeMenu } = headerSlice.actions;
export default headerSlice.reducer;