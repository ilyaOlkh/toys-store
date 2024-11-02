// userSlice.ts
import { Claims } from "@auth0/nextjs-auth0";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface Role {
    name: string;
}

interface UserState {
    user: (Claims & { roles?: Role[] }) | null;
}

const initialState: UserState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<(Claims & { roles?: Role[] }) | null>
        ) => {
            state.user = action.payload;
        },
        setUserRoles: (state, action: PayloadAction<Role[]>) => {
            if (state.user) {
                state.user.roles = action.payload;
            }
        },
        clearUser: (state) => {
            state.user = null;
        },
        setUserPicture: (state, action: PayloadAction<string | null>) => {
            if (state.user) {
                state.user.picture = action.payload;
            }
        },
    },
});

export const selectIsAdmin = (state: RootState) =>
    state.user.user?.roles?.some((role) => role.name === "admin") ?? false;

export const { setUser, clearUser, setUserPicture, setUserRoles } =
    userSlice.actions;

export default userSlice.reducer;
