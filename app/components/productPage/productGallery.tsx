"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ProductGalleryProps {
    images: {
        id: number;
        url: string;
    }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
    const [thumbsSwiperLoaded, setThumbsSwiperLoaded] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square relative border border-lightGray1 rounded-3xl p-4">
                <Image
                    src="/noPhoto.png"
                    alt="No photo available"
                    fill
                    className="object-contain rounded-2xl"
                />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Main Gallery Container */}
            <div className="border border-lightGray1 rounded-3xl p-4">
                <Swiper
                    spaceBetween={10}
                    navigation={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="product-main-slider rounded-2xl"
                >
                    {images.map((image) => (
                        <SwiperSlide key={image.id}>
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={image.url}
                                    alt="Product image"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Thumbnails Container */}
            {images.length > 1 && (
                <div
                    className={`mt-4 ${
                        thumbsSwiperLoaded
                            ? ""
                            : "pt-[calc(22.2222%-2.22222px-5.5px)]"
                    }`}
                >
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={4.5}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className={`product-thumbs-slider ${
                            thumbsSwiperLoaded ? "" : "opacity-0 h-0 max-h-0"
                        } transition-opacity duration-300`}
                        onInit={() => setThumbsSwiperLoaded(true)}
                    >
                        {images.map((image) => (
                            <SwiperSlide key={image.id}>
                                <div className="relative aspect-square border border-lightGray1 rounded-xl p-2 cursor-pointer">
                                    <Image
                                        src={image.url}
                                        alt="Product thumbnail"
                                        fill
                                        className="object-contain rounded-lg"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    );
}
