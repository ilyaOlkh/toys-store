// types/slider.ts

// Тип для отдельного изображения в слайдере
export interface SliderImage {
    id: number;
    url: string;
}

// Пропсы компонента слайдера
export interface SynchronizedImageSliderProps {
    images: SliderImage[];
    // Опциональные пропсы для кастомизации
    initialIndex?: number;
    showArrows?: boolean;
    showThumbnails?: boolean;
    thumbnailsPerView?: number;
    className?: string;
}

// Тип для состояния слайдера
export interface SliderState {
    currentIndex: number;
    isTransitioning: boolean;
    direction: "next" | "prev" | null;
}
