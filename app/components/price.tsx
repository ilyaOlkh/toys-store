"use client";

import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"] });

const currency = "₴";

export default function Price({
    firstPrice,
    discountPrice,
    hideOriginalPrice = false,
}: {
    firstPrice: string;
    discountPrice?: string;
    hideOriginalPrice?: boolean;
}) {
    if (discountPrice && +discountPrice > 0) {
        return (
            <div className={poppins.className + " flex items-end gap-1"}>
                <div className="font-semibold text-[17px] text-[#1BBF00]">
                    {Number(discountPrice).toFixed(2)} {currency}
                </div>
                {!hideOriginalPrice && (
                    <div className="font-medium text-[13px] text-[#898989] line-through">
                        {Number(firstPrice).toFixed(2)} {currency}
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className={poppins.className + ""}>
                <div className="font-semibold text-[17px]">
                    {Number(firstPrice).toFixed(2)} {currency}
                </div>
            </div>
        );
    }
}
