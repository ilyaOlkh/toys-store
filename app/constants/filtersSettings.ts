import { Filter } from "../types/filters";

export const serverFilters: Filter[] = [
    {
        name: "Типи",
        type: "select",
        defaultValue: null,
        title: "Типи",
        options: [
            { value: "Набори для гри", label: "Набори для гри" },
            { value: "Іграшки для керування", label: "Іграшки для керування" },
            { value: "Навчальні іграшки", label: "Навчальні іграшки" },
            { value: "Еко-іграшки", label: "Еко-іграшки" },
            { value: "М'які іграшки", label: "М'які іграшки" },
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
        defaultValue: { from: 0, to: 10000 },
        title: "Price",
        min: 0,
        max: 10000,
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
