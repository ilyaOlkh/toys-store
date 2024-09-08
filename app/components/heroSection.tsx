'use client'

import Image from "next/image"

import { Baloo_Bhaina_2 } from "next/font/google";
const baloo_Bhaina_2 = Baloo_Bhaina_2({ subsets: ["latin"] });

export default function HeroSection() {
    return <div className='h-screen w-full bg-center bg-no-repeat relative pl-[10%] xs:pl-[30%] md:pl-[50%] flex items-center min-h-[550px]'>
        <Image src='/Hero-bg.png' alt='hero bg' width={1440} height={810} className="absolute top-0 left-0 w-full h-full object-cover" />
        <div className='customContainer relative z-1 flex flex-col gap-5 items-start '>
            <h1 className={baloo_Bhaina_2.className + " text-4xl font-bold text-[#1096B5] textShadow text-[68px] leading-[60px]"}>
                Play, learn, & grow!
            </h1>
            <div className="text-[#375259] text-xl font-bold mt-4">
                Crafting smiles with every toy, made for learning, fun, and growth
            </div>
            <a href="/products" className="font-bold rounded-full text-xl py-[22px] px-[45px] bg-[#FFE926] mt-16">
                Shop now
            </a>
        </div>
    </div>
}