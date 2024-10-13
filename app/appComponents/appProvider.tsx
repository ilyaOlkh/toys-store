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
