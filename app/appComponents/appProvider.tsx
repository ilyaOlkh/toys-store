"use client";

import { Comfortaa } from "next/font/google";
import { createTheme, ThemeProvider } from "@mui/material";

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
        MuiDrawer: {
            styleOverrides: {
                root: {
                    "& .MuiBackdrop-root": {
                        backdropFilter: "blur(10px)",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
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
                        width: "100px",
                        backgroundColor: "#fff",
                        borderRadius: "3px",
                        marginTop: "-3px",
                        zIndex: 100,
                        opacity: "0.5",
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    padding: "4px 32px 4px 8px !important", // Consistent padding across all screen sizes
                    "&.MuiInputBase-input": {
                        minHeight: "unset",
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    minHeight: "32px",
                    fontSize: "14px",
                    "&.Mui-selected": {
                        backgroundColor: "rgba(15, 131, 178, 0.08)",
                    },
                    "@media (max-width:640px)": {
                        minHeight: "32px", // Force same height on mobile
                    },
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: "4px",
                },
            },
        },
    },
});

export default function AppProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
