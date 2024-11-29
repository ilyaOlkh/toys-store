import { Filter } from "../types/filters";

// Определяем все фильтры с их серверной логикой
export const serverFilters: Filter[] = [
    {
        name: "category",
        type: "select",
        defaultValue: null,
        title: "Category",
        options: [
            { value: "toys", label: "Toys" },
            { value: "electronics", label: "Electronics" },
        ],
        prismaQuery: (value) => ({
            types: {
                some: {
                    type: {
                        name: value,
                    },
                },
            },
        }),
    },
    {
        name: "price",
        type: "range",
        defaultValue: { from: 0, to: 1000 },
        title: "Price",
        min: 0,
        max: 1000,
        prismaQuery: (value) => ({
            AND: [{ price: { gte: value.from } }, { price: { lte: value.to } }],
        }),
    },
    {
        name: "inStock",
        type: "toggle",
        defaultValue: false,
        title: "In Stock",
        prismaQuery: (value) =>
            value
                ? {
                      stock_quantity: { gt: 0 },
                  }
                : {},
    },
];
