import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                white1: '#F7F7F6',
                blue1: '#0F83B2',
                orange1: '#E3B110',
                gray1: '#7F7F7F',
                lightGray1: '#D4D4D4',
            }
        },
    },
    plugins: [],
};
export default config;
