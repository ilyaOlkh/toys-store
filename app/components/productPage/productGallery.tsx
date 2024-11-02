"use client";

import React, { useState } from "react";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Autoplay } from "swiper/modules";
// Import Swiper styles
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
            {/* Main Slider */}
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

            {/* Thumbs Slider */}
            {images.length > 1 && (
                <div className="mt-4">
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={4.5}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="product-thumbs-slider"
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
