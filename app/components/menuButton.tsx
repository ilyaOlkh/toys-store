"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { toggleModal } from "../redux/modalSlice";
import { Menu } from "@mui/icons-material";

export default function MenuButton() {
    const dispatch = useDispatch<AppDispatch>();
    return (
        <div
            className="cursor-pointer"
            onClick={() => dispatch(toggleModal("burger"))}
        >
            <Menu fontSize="large" />
        </div>
    );
}
