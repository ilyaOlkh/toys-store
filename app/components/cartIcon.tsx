"use client";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { toggleModal } from "../redux/modalSlice";
import { useAppSelector } from "../redux/hooks";
import { selectTotalQuantity } from "../redux/cartSelectors";

const poppins = Poppins({ weight: "500", subsets: ["latin"] });

export default function CartIcon() {
    const dispatch = useDispatch<AppDispatch>();
    const cartItemsNum = useAppSelector(selectTotalQuantity);

    return (
        <Button
            sx={{
                padding: "0.5rem",
                minWidth: "2rem",
                borderRadius: "9999px",
            }}
            onClick={() => dispatch(toggleModal("cart"))}
            className={`${poppins.className} relative shrink-0 basis-[48px] w-[48px] cursor-pointer`}
        >
            <div>
                <Image
                    src={"/cart-icon.svg"}
                    alt="cart icon"
                    width={32}
                    height={32}
                />
            </div>
            {cartItemsNum > 0 && (
                <div className="absolute top-2 right-2 rounded-full bg-orange1 w-5 h-5 text-sm flex items-center justify-center translate-x-1/2 -translate-y-1/2 text-black">
                    {cartItemsNum}
                </div>
            )}
        </Button>
    );
}
