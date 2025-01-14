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

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    orderEmail?: string;
}

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
        updateUserProfile: (
            state,
            action: PayloadAction<UpdateProfileData>
        ) => {
            if (state.user) {
                if (action.payload.firstName) {
                    state.user.given_name = action.payload.firstName;
                }
                if (action.payload.lastName) {
                    state.user.family_name = action.payload.lastName;
                }
                if (action.payload.firstName || action.payload.lastName) {
                    state.user.name = `${action.payload.firstName || state.user.given_name} ${action.payload.lastName || state.user.family_name}`;
                }
                state.user.user_metadata = {
                    ...state.user.user_metadata,
                    ...(action.payload.phone && {
                        phone: action.payload.phone,
                    }),
                    ...(action.payload.orderEmail && {
                        orderEmail: action.payload.orderEmail,
                    }),
                };
            }
        },
    },
});

export const selectIsAdmin = (state: RootState) =>
    state.user.user?.roles?.some((role) => role.name === "admin") ?? false;

export const {
    setUser,
    clearUser,
    setUserPicture,
    setUserRoles,
    updateUserProfile,
} = userSlice.actions;

export default userSlice.reducer;
