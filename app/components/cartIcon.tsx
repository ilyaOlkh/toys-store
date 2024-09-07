import Image from "next/image";
import { Poppins } from "next/font/google";
const poppins = Poppins({ weight: "500", subsets: ["latin"] });

export default function CartIcon() {
    return <div className={`${poppins.className} relative shrink-0 basis-[25px] w-[25px] cursor-pointer`}>
        <Image src={'/cart-icon.svg'} alt="cart icon" width={25} height={26} />
        <div className="absolute top-0 right-0 rounded-full bg-orange1 w-5 h-5 text-sm flex items-center justify-center translate-x-1/2 -translate-y-1/2">1</div>
    </div>
}