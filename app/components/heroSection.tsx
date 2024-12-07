"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="h-screen w-full bg-center bg-no-repeat relative pl-[0] xs:pl-[15%] md:pl-[30%] flex items-center min-h-[550px]">
            <Image
                src="/Hero-bg.png"
                alt="hero bg"
                width={1440}
                height={810}
                className="absolute top-0 left-0 w-full h-full object-cover object-[30%_center]"
            />
            <div className="customContainer relative z-1 flex flex-col gap-5 items-start ">
                <h1
                    className={
                        "text-4xl font-extrabold text-[#1096B5] textShadow text-[40px] md:text-[68px] leading-[60px]"
                    }
                >
                    Грай, навчайся та розвивайся!
                </h1>
                <div className="text-[#375259] text-xl font-bold mt-4">
                    Створюємо посмішки з кожною іграшкою, зробленою для
                    навчання, розваг та розвитку
                </div>
                <a
                    href="/products"
                    className="font-bold rounded-full text-xl py-[22px] px-[45px] bg-[#FFE926] mt-16"
                >
                    Купити зараз
                </a>
            </div>
        </div>
    );
}
