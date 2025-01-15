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
import Image from "next/image";
import { useAppSelector } from "../redux/hooks";
import { Comfortaa } from "next/font/google";
import {
    ADMIN_MENU_ITEMS,
    MENU_ITEM_LOGOUT,
    MENU_ITEMS,
} from "../constants/user-menu-constants";

interface UserMenuProps {
    username: string;
}

const comfortaa = Comfortaa({ subsets: ["latin"] });

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const avatarUrl = useAppSelector((state) => state.user.user!.picture);
    const userRoles = useAppSelector((state) => state.user.user?.roles);

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
                        width={40}
                        height={40}
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
                {Object.keys(MENU_ITEMS).map((key) => {
                    return (
                        <MenuItem onClick={handleClose}>
                            <a href={MENU_ITEMS[key].link} className="w-full">
                                {MENU_ITEMS[key].name}
                            </a>
                        </MenuItem>
                    );
                })}
                {userRoles?.some((role) => role.name === "admin") &&
                    Object.keys(ADMIN_MENU_ITEMS).map((key) => {
                        return (
                            <MenuItem onClick={handleClose}>
                                <a
                                    href={ADMIN_MENU_ITEMS[key].link}
                                    className="w-full"
                                >
                                    {ADMIN_MENU_ITEMS[key].name}
                                </a>
                            </MenuItem>
                        );
                    })}
                <Divider />
                <MenuItem onClick={handleClose} sx={{ color: "gray" }}>
                    <a href={MENU_ITEM_LOGOUT.link} className="w-full">
                        {MENU_ITEM_LOGOUT.name}
                    </a>
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;
