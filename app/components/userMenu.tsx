"use client";

import React, { useState } from "react";
import {
    Menu,
    MenuItem,
    IconButton,
    Divider,
    Typography,
    paperClasses,
    Paper,
    Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Image from "next/image";
import { useAppSelector } from "../redux/hooks";
import { Comfortaa } from "next/font/google";
import { MENU_ITEM_LOGOUT, MENU_ITEMS } from "../constants/user-menu-constants";

interface UserMenuProps {
    username: string;
}

const comfortaa = Comfortaa({ subsets: ["latin"] });

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const avatarUrl = useAppSelector((state) => state.user.user!.picture);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                onClick={handleClick}
                color="inherit"
                className="rounded-lg gap-1"
                variant="text"
            >
                <div className="rounded-full overflow-hidden ">
                    <Image
                        src={avatarUrl}
                        alt="avatar"
                        width={30}
                        height={30}
                    />
                </div>
                <div
                    className={
                        "text-base pl-1 normal-case " + comfortaa.className
                    }
                >
                    {username}
                </div>
            </Button>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        className:
                            "border border-gray-300 rounded-lg shadow-lg z-10 p-0",
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {/* <MenuItem onClick={handleClose} className="p-0"> */}
                {Object.keys(MENU_ITEMS).map((key) => {
                    return (
                        <MenuItem onClick={handleClose} className="p-0">
                            <a
                                href={MENU_ITEMS[key].link}
                                className="size-full py-[6px] px-[16px]"
                            >
                                {MENU_ITEMS[key].name}
                            </a>
                        </MenuItem>
                    );
                })}
                {/* </MenuItem> */}
                <Divider />
                <MenuItem
                    onClick={handleClose}
                    sx={{ color: "gray" }}
                    className="p-0"
                >
                    <a
                        className="size-full py-[6px] px-[16px]"
                        href={MENU_ITEM_LOGOUT.link}
                    >
                        {MENU_ITEM_LOGOUT.name}
                    </a>
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;
