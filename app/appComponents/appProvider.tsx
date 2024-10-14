"use client";

import { Comfortaa } from "next/font/google";
import { createTheme, ThemeProvider } from "@mui/material";
import { Opacity } from "@mui/icons-material";

const comfortaa = Comfortaa({ subsets: ["latin"] });

const theme = createTheme({
    palette: {
        primary: {
            main: "#0F83B2",
        },
    },
    typography: {
        fontFamily: comfortaa.style.fontFamily,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1200,
            xl: 1536,
        },
    },
    components: {
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    width: "100%",
                    marginTop: "100px",
                    boxSizing: "border-box",
                    backdropFilter: "blur(1rem)",
                    height: "calc(100% - 100px)",
                    borderRadius: "16px",
                    overflowX: "visible",
                    overflowY: "visible",
                    "@media (min-width:640px)": {
                        width: "400px",
                        marginTop: "0px",
                        height: "100%",
                        borderRadius: "0px",

                        "&::before": {
                            display: "none",
                        },
                    },
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "-10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        height: "6px",
                        width: "100px", // Width of the indicator
                        backgroundColor: "#fff", // Color of the indicator
                        borderRadius: "3px", // Optional: rounded corners
                        marginTop: "-3px", // Position it slightly above the drawer
                        zIndex: 100, // Ensure it appears above other content
                        opacity: "0.5",
                    },
                },
            },
        },
    },
    // components: {
    //     MuiButton: {
    //         styleOverrides: {
    //             root: {
    //                 borderRadius: "8px", // Изменение стиля кнопок
    //             },
    //         },
    //     },
    // },
});
export default function AppProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
