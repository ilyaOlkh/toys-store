"use client";

import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"] });

const currency = "₴";

export default function Price({
    firstPrice,
    discountPrice,
    hideOriginalPrice = false,
    textSize,
    fontClass,
}: {
    firstPrice: string;
    discountPrice?: string;
    hideOriginalPrice?: boolean;
    textSize?: "28" | "20" | "17";
    fontClass?: string;
}) {
    if (discountPrice && +discountPrice > 0 && discountPrice !== firstPrice) {
        return (
            <div
                className={
                    fontClass ??
                    poppins.className +
                        ` flex items-end gap-1 ${textSize ? `text-[${textSize}px]` : ""}`
                }
            >
                <div className={`font-semibold text-[#1BBF00]`}>
                    {currency} {Number(discountPrice).toFixed(2)}
                </div>
                {!hideOriginalPrice && (
                    <div
                        className={`font-medium text-[#898989] line-through text-[0.5em]`}
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
                    className={`font-semibold ${textSize ? `text-[${textSize}px]` : ""}`}
                >
                    {currency} {Number(firstPrice).toFixed(2)}
                </div>
            </div>
        );
    }
}
