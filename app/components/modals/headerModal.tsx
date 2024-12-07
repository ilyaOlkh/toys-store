"use client";

import React from "react";
import {
    Drawer,
    Divider,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    useMediaQuery,
    SwipeableDrawer,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import { Comfortaa } from "next/font/google";
import { routes } from "../../constants/routes-constants";
import {
    MENU_ITEM_LOGOUT,
    MENU_ITEMS,
} from "../../constants/user-menu-constants";
import { closeModal } from "../../redux/modalSlice";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export default function HeaderModal() {
    const dispatch = useDispatch<AppDispatch>();
    const menuOpen = useAppSelector(
        (state: RootState) => state.modal.openModal === "burger"
    );
    const user = useAppSelector((state: RootState) => state.user.user);
    const avatarUrl = useAppSelector((state) => state.user.user?.picture);
    const username = useAppSelector(
        (state: RootState) => state.user.user?.name ?? state.user.user?.nickname
    );
    const isMobile = useMediaQuery("(max-width: 768px)");
    return (
        isMobile && (
            <SwipeableDrawer
                open={menuOpen}
                onClose={() => dispatch(closeModal())}
                disableSwipeToOpen={true}
                onOpen={() => {}}
                anchor="right"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: 240,
                        boxSizing: "border-box",
                        height: "100%",
                        borderRadius: "0px",
                        margin: "0px",
                    },
                }}
                className="block md:hidden"
            >
                <Box>
                    {user ? (
                        <Accordion sx={{ boxShadow: "none" }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                component={Button}
                                sx={{ width: "100%" }}
                            >
                                <div className="flex gap-2 items-center">
                                    <div className="rounded-full overflow-hidden shrink-0">
                                        <Image
                                            src={avatarUrl}
                                            alt="avatar"
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                    <div
                                        className={
                                            "text-base text-black pl-1 normal-case text-left self-start flex items-center overflow-hidden h-full w-full " +
                                            comfortaa.className
                                        }
                                    >
                                        {username}
                                    </div>
                                </div>
                            </AccordionSummary>
                            <Divider />
                            <AccordionDetails>
                                <div className="flex flex-col gap-1">
                                    {Object.keys(MENU_ITEMS).map((key) => {
                                        return (
                                            <a
                                                href={MENU_ITEMS[key].link}
                                                className="size-full py-[6px] font-bold text-lg leading-5"
                                            >
                                                {MENU_ITEMS[key].name}
                                            </a>
                                        );
                                    })}
                                    <a
                                        className="size-full py-[6px] font-bold text-lg leading-5 text-[#b0b2b5]"
                                        href={MENU_ITEM_LOGOUT.link}
                                    >
                                        {MENU_ITEM_LOGOUT.name}
                                    </a>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ) : (
                        <Box className="flex flex-row p-4 gap-3">
                            <Box className="flex-grow flex justify-start">
                                <a
                                    href={routes.login}
                                    className=" h-full w-full"
                                >
                                    <button className="px-4 py-2 bg-blue1 text-white rounded h-full w-full ">
                                        Login
                                    </button>
                                </a>
                            </Box>
                            <Box className="flex-grow flex justify-end">
                                <a href={routes.register}>
                                    <button className="px-4 py-2 border-2 border-blue1 text-blue1 rounded hover:bg-blue1/10">
                                        Register
                                    </button>
                                </a>
                            </Box>
                        </Box>
                    )}
                    <Divider />
                    <nav className="mb-4 font-bold text-lg p-4">
                        <a href="/" className="block mb-2">
                            Головна
                        </a>
                        <a href="/products" className="block  mb-2">
                            Магазин
                        </a>
                        <a href="/contact" className="block mb-2">
                            Контакти
                        </a>
                    </nav>
                </Box>
            </SwipeableDrawer>
        )
    );
}
