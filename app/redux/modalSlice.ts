import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalType } from "../constants/modal-constants";

interface ModalState {
    openModal: ModalType;
}

const initialState: ModalState = {
    openModal: null,
};

const modalSlice = createSlice({
    name: "modals",
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<ModalType>) => {
            state.openModal = action.payload;
            if (action.payload) {
                window.history.pushState(null, "", `#${action.payload}`);
            }
        },
        closeModal: (state) => {
            state.openModal = null;
            window.history.pushState(null, "", window.location.pathname);
        },
        toggleModal: (state, action: PayloadAction<ModalType>) => {
            if (state.openModal === action.payload) {
                state.openModal = null;
                window.history.pushState(null, "", window.location.pathname);
            } else {
                state.openModal = action.payload;
                window.history.pushState(null, "", `#${action.payload}`);
            }
        },
        initModalFromHash: (state, action: PayloadAction<ModalType>) => {
            state.openModal = action.payload;
        },
    },
});

export const { openModal, closeModal, toggleModal, initModalFromHash } =
    modalSlice.actions;

export default modalSlice.reducer;
