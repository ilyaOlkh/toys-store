import { Prisma } from "@prisma/client";

export type FilterType = "select" | "range" | "multi-select" | "toggle";

export type PrismaWhereInput = Prisma.productsWhereInput;
export type RawQueryFilter = { id: { in: Prisma.Sql } };
export type FilterQueryResult = PrismaWhereInput | RawQueryFilter;

export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | { from: number; to: number }
    | null;

export interface ComputedField {
    name: string;
    compute: () => Promise<Prisma.Sql>;
}

interface BaseFilter {
    name: string;
    type: FilterType;
    defaultValue: any;
    title: string;
    defaultExpanded?: boolean;
    generateValues?: () => Promise<Partial<Filter>>;
    computedFields?: ComputedField[];
    prismaQuery: (value: any) => Prisma.productsWhereInput | FilterQueryResult;
}

export interface SelectFilter extends BaseFilter {
    type: "select";
    options: { value: string; label: string }[];
}

export interface RangeFilter extends BaseFilter {
    type: "range";
    min: number;
    max: number;
    unit?: {
        symbol: string;
        position?: "prefix" | "suffix";
    };
}

export interface MultiSelectFilter extends BaseFilter {
    type: "multi-select";
    options: { value: string; label: string }[];
}

export interface ToggleFilter extends BaseFilter {
    type: "toggle";
}

export type Filter =
    | SelectFilter
    | RangeFilter
    | MultiSelectFilter
    | ToggleFilter;

export type ClientFilter =
    | Omit<SelectFilter, "prismaQuery" | "generateValues">
    | Omit<RangeFilter, "prismaQuery" | "generateValues">
    | Omit<MultiSelectFilter, "prismaQuery" | "generateValues">
    | Omit<ToggleFilter, "prismaQuery" | "generateValues">;

export interface ActiveFilter {
    name: string;
    value: FilterValue;
}

// Тип для сортировки

export type SortDirection = "asc" | "desc";

export interface ComputedSortField {
    name: string;
    compute: () => Promise<Prisma.Sql>;
}

export interface SortOption {
    field: string;
    label: string;
    prismaSort?: (
        direction: SortDirection
    ) => Prisma.productsOrderByWithRelationInput;
    computedFields?: ComputedSortField[];
    computed?: boolean;
    sort?: (a: any, b: any, direction: SortDirection) => number;
}

export interface SortConfig {
    name: string;
    title: string;
    options: SortOption[];
    defaultOption: string;
    defaultDirection: SortDirection;
    allowDirectionChange?: boolean;
}
