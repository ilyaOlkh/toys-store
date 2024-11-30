import { Prisma } from "@prisma/client";

export type FilterType = "select" | "range" | "multi-select" | "toggle";

// Возможные значения фильтров
export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | { from: number; to: number }
    | null;

interface BaseFilter {
    name: string;
    type: FilterType;
    defaultValue: any;
    title: string; // Человекочитаемое название для UI
}

// Определяем типы для разных видов фильтров
export interface SelectFilter extends BaseFilter {
    type: "select";
    options: { value: string; label: string }[];
    prismaQuery: (value: string) => Prisma.productsWhereInput;
}

export interface RangeFilter extends BaseFilter {
    type: "range";
    min: number;
    max: number;
    prismaQuery: (value: {
        from: number;
        to: number;
    }) => Prisma.productsWhereInput;
}

export interface MultiSelectFilter extends BaseFilter {
    type: "multi-select";
    options: { value: string; label: string }[];
    prismaQuery: (values: string[]) => Prisma.productsWhereInput;
}

export interface ToggleFilter extends BaseFilter {
    type: "toggle";
    prismaQuery: (value: boolean) => Prisma.productsWhereInput;
}

export type Filter =
    | SelectFilter
    | RangeFilter
    | MultiSelectFilter
    | ToggleFilter;

export type ClientFilter =
    | Omit<SelectFilter, "prismaQuery">
    | Omit<RangeFilter, "prismaQuery">
    | Omit<MultiSelectFilter, "prismaQuery">
    | Omit<ToggleFilter, "prismaQuery">;

export interface ActiveFilter {
    name: string;
    value: FilterValue;
}

// Тип для сортировки
export interface SortConfig {
    field: string;
    direction: "asc" | "desc";
}
