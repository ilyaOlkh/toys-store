import { Claims } from "@auth0/nextjs-auth0";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    user: Claims | null;
}

const initialState: UserState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
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

export const { setUser, clearUser, setUserPicture } = userSlice.actions;
export default userSlice.reducer;
