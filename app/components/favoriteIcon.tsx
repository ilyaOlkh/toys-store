import Image from "next/image";
import { Poppins } from "next/font/google";
import { Button } from "@mui/material";
const poppins = Poppins({ weight: "500", subsets: ["latin"] });

export default function FavoriteIcon() {
    return (
        <div
            className={`${poppins.className} relative shrink-0 basis-[48px] w-[48px] cursor-pointer `}
        >
            <Button
                sx={{
                    padding: "0.5rem",
                    minWidth: "2rem",
                    borderRadius: "9999px",
                }}
            >
                <Image
                    src={"/icons/heart-filled.png"}
                    alt="cart icon"
                    width={32}
                    height={32}
                />
            </Button>
            <div className="absolute top-2 right-2 rounded-full bg-orange1 w-5 h-5 text-sm flex items-center justify-center translate-x-1/2 -translate-y-1/2">
                10
            </div>
        </div>
    );
}
