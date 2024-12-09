export const modalTypes = {
    BURGER: "burger",
    FAVORITES: "favorites",
    CART: "cart",
    FILTERS: "filters",
} as const;

export type ModalType = (typeof modalTypes)[keyof typeof modalTypes] | null;
