import { Prisma } from "@prisma/client";

// Base types
export type FilterType = "select" | "range" | "multi-select" | "toggle";
export type SortDirection = "asc" | "desc";
export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | { from: number; to: number }
    | null;

export interface RawQueryResult {
    rawQuery: Prisma.Sql;
}

interface BaseFilter {
    name: string;
    type: FilterType;
    defaultValue: any;
    title: string;
    defaultExpanded?: boolean;
    generateValues?: () => Promise<Partial<Filter>>;
    buildQuery: (value: any) => RawQueryResult;
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

// Client-side filter types (omitting server-specific fields)
export type ClientFilter =
    | Omit<SelectFilter, "buildQuery" | "generateValues">
    | Omit<RangeFilter, "buildQuery" | "generateValues">
    | Omit<MultiSelectFilter, "buildQuery" | "generateValues">
    | Omit<ToggleFilter, "buildQuery" | "generateValues">;

export interface ActiveFilter {
    name: string;
    value: FilterValue;
}

// Sort Types
export interface SortOption {
    field: string;
    label: string;
    buildQuery: () => Prisma.Sql;
}

export interface SortConfig {
    name: string;
    title: string;
    options: SortOption[];
    defaultOption: string;
    defaultDirection: SortDirection;
    allowDirectionChange?: boolean;
}
