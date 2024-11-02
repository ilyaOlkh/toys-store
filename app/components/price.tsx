"use client";

import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"] });

const currency = "₴";

export default function Price({
    firstPrice,
    discountPrice,
    hideOriginalPrice = false,
    textSize,
}: {
    firstPrice: string;
    discountPrice?: string;
    hideOriginalPrice?: boolean;
    textSize?: "28" | "17";
}) {
    if (discountPrice && +discountPrice > 0) {
        return (
            <div className={poppins.className + " flex items-end gap-1"}>
                <div
                    className={`font-semibold text-[17px] text-[#1BBF00] ${
                        textSize === "28" ? "text-[28px]" : ""
                    }`}
                >
                    {currency} {Number(discountPrice).toFixed(2)}
                </div>
                {!hideOriginalPrice && (
                    <div
                        className={`font-medium text-[13px] text-[#898989] line-through ${
                            textSize === "28" ? "text-[22px]" : ""
                        }`}
                    >
                        {currency} {Number(firstPrice).toFixed(2)}
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className={poppins.className + ""}>
                <div
                    className={`font-semibold text-[17px] ${
                        textSize === "28" ? "text-[28px]" : ""
                    }`}
                >
                    {currency} {Number(firstPrice).toFixed(2)}
                </div>
            </div>
        );
    }
}
