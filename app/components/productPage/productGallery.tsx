"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Plus } from "lucide-react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { useAppSelector } from "@/app/redux/hooks";
import { selectIsAdmin } from "@/app/redux/userSlice";
import { uploadMultipleProductImages } from "@/app/utils/uploadImgs";

interface ProductGalleryProps {
    images: {
        id: number;
        url: string;
    }[];
    productSku: string;
}

interface UploadingImage {
    id: number;
    url: string;
    status: "uploading" | "success" | "error";
}

export default function ProductGallery({
    images,
    productSku,
}: ProductGalleryProps) {
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
    const [thumbsSwiperLoaded, setThumbsSwiperLoaded] = useState(false);
    const isAdmin = useAppSelector(selectIsAdmin);
    const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>(
        []
    );
    const [isUploading, setIsUploading] = useState(false);

    const allImages = [
        ...images,
        ...uploadingImages.filter((img) => img.status !== "error"),
    ];

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        try {
            await uploadMultipleProductImages(
                files,
                productSku,
                (tempId, tempUrl, status) => {
                    setUploadingImages((prev) => {
                        const existing = prev.find((img) => img.id === tempId);
                        if (existing) {
                            return prev.map((img) =>
                                img.id === tempId ? { ...img, status } : img
                            );
                        }
                        return [...prev, { id: tempId, url: tempUrl, status }];
                    });
                }
            );
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setIsUploading(false);
            // Clean up successful uploads after a delay
            // setTimeout(() => {
            //     setUploadingImages((prev) =>
            //         prev.filter((img) => img.status !== "success")
            //     );
            // }, 1000);
        }
    };

    return (
        <div>
            {!images || images.length === 0 ? (
                <div className="w-full aspect-square relative border border-lightGray1 rounded-3xl p-4">
                    <Image
                        src="/noPhoto.png"
                        alt="No photo available"
                        fill
                        className="object-contain rounded-2xl"
                    />
                    {isAdmin && (
                        <div className="absolute bottom-6 left-6 z-10">
                            <label className="flex items-center justify-center relative aspect-square border border-lightGray1 rounded-xl p-2 cursor-pointer bg-white/70 hover:bg-white/90 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                                <Plus
                                    className={`w-8 h-8 text-blue1 ${
                                        isUploading ? "animate-spin" : ""
                                    }`}
                                />
                            </label>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border border-lightGray1 rounded-3xl p-4 relative w-full">
                    <Swiper
                        spaceBetween={10}
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="product-main-slider rounded-2xl w-full"
                    >
                        {allImages.map((image) => (
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
                    {isAdmin && (
                        <div className="absolute bottom-6 left-6 z-10">
                            <label className="flex items-center justify-center relative aspect-square border border-lightGray1 rounded-xl p-2 cursor-pointer bg-white/70 hover:bg-white/90 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                                <Plus
                                    className={`w-8 h-8 text-blue1 ${
                                        isUploading ? "animate-spin" : ""
                                    }`}
                                />
                            </label>
                        </div>
                    )}
                </div>
            )}

            {/* Thumbnails Container */}
            {allImages.length > 1 && (
                <div
                    className={`flex gap-4 p-4 pt-[min(calc(22.2222%-2.22222px-5.5px),100px)] relative mt-4`}
                >
                    <div className="absolute left-0 top-0 h-full w-full">
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={4.5}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className={`product-thumbs-slider ${
                                thumbsSwiperLoaded
                                    ? ""
                                    : "opacity-0 h-0 max-h-0"
                            } transition-opacity duration-300`}
                            onInit={() => setThumbsSwiperLoaded(true)}
                        >
                            {allImages.map((image) => (
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
                </div>
            )}
        </div>
    );
}
