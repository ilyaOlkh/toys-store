import { Filter, SortConfig } from "../types/filters";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const serverFilters: Filter[] = [
    {
        name: "типи",
        type: "multi-select",
        defaultValue: null,
        title: "Типи",
        options: [],
        generateValues: async () => {
            const types = await prisma.$queryRaw<{ name: string }[]>`
                SELECT DISTINCT name 
                FROM types 
                ORDER BY name ASC
            `;
            return {
                options: types.map((type) => ({
                    value: type.name,
                    label: type.name,
                })),
            };
        },
        buildQuery: (values: string[]) => ({
            rawQuery: Prisma.sql`
                EXISTS (
                    SELECT 1 
                    FROM product_types pt
                    JOIN types t ON pt.type_id = t.id
                    WHERE pt.product_id = p.id 
                    AND t.name IN (${Prisma.join(values)})
                )
            `,
        }),
        defaultExpanded: true,
    },
    {
        name: "tags",
        type: "multi-select",
        defaultValue: [],
        title: "Теги",
        options: [],
        generateValues: async () => {
            const tags = await prisma.$queryRaw<{ name: string }[]>`
                SELECT name 
                FROM tags 
                ORDER BY name ASC
            `;
            return {
                options: tags.map((tag) => ({
                    value: tag.name,
                    label: tag.name,
                })),
            };
        },
        buildQuery: (values: string[]) => ({
            rawQuery: Prisma.sql`
                EXISTS (
                    SELECT 1 
                    FROM product_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.product_id = p.id 
                    AND t.name IN (${Prisma.join(values)})
                )
            `,
        }),
        defaultExpanded: true,
    },
    {
        name: "stock",
        type: "toggle",
        defaultValue: false,
        title: "Тільки в наявності",
        buildQuery: (value: boolean) => ({
            rawQuery: value
                ? Prisma.sql`p.stock_quantity > 0`
                : Prisma.sql`TRUE`,
        }),
    },
    {
        name: "discounted",
        type: "toggle",
        defaultValue: false,
        title: "Зі знижкою",
        buildQuery: (value: boolean) => ({
            rawQuery: value
                ? Prisma.sql`
                    EXISTS (
                        SELECT 1 
                        FROM discounts d 
                        WHERE d.product_id = p.id 
                        AND d.start_date <= CURRENT_TIMESTAMP 
                        AND d.end_date >= CURRENT_TIMESTAMP
                    )`
                : Prisma.sql`TRUE`,
        }),
    },
    {
        name: "ціна",
        type: "range",
        defaultValue: { from: 0, to: 10000 },
        title: "Ціна",
        min: 0,
        max: 10000,
        unit: {
            symbol: "₴",
            position: "suffix",
        },
        generateValues: async () => {
            const result = await prisma.$queryRaw<[{ max_price: number }]>`
                SELECT MAX(price) as max_price FROM products
            `;
            const maxPrice = Number(result[0]?.max_price) ?? 10000;
            return {
                defaultValue: { from: 0, to: maxPrice },
                max: maxPrice,
            };
        },
        buildQuery: (value: { from: number; to: number }) => ({
            rawQuery: Prisma.sql`p.price >= ${value.from} AND p.price <= ${value.to}`,
        }),
    },
    {
        name: "average_rating",
        type: "range",
        defaultValue: { from: 0, to: 5 },
        title: "Середній рейтинг",
        min: 0,
        max: 5,
        unit: {
            symbol: "★",
            position: "suffix",
        },
        generateValues: async () => {
            const result = await prisma.$queryRaw<[{ max_avg: number }]>`
                SELECT COALESCE(MAX(avg_rating), 5) as max_avg 
                FROM (
                    SELECT AVG(rating) as avg_rating 
                    FROM comments 
                    GROUP BY product_id
                ) as avg_ratings
            `;
            const maxAverageRating = Number(result[0]?.max_avg) ?? 5;
            return {
                defaultValue: { from: 0, to: maxAverageRating },
                max: maxAverageRating,
            };
        },
        buildQuery: (value: { from: number; to: number }) => ({
            rawQuery: Prisma.sql`
                (
                    SELECT COALESCE(AVG(rating), 0)
                    FROM comments c
                    WHERE c.product_id = p.id
                ) BETWEEN ${value.from} AND ${value.to}
            `,
        }),
    },
];

export const serverSorts: SortConfig[] = [
    {
        name: "mainSort",
        title: "Сортувати за",
        options: [
            {
                field: "default",
                label: "За замовчуванням",
                buildQuery: () => Prisma.sql`p.id ASC`,
            },
            {
                field: "price_asc",
                label: "Ціною: від дешевших до дорожчих",
                buildQuery: () => Prisma.sql`p.price ASC`,
            },
            {
                field: "price_desc",
                label: "Ціною: від дорожчих до дешевших",
                buildQuery: () => Prisma.sql`p.price DESC`,
            },
            {
                field: "created_at_desc",
                label: "Спочатку новіші",
                buildQuery: () => Prisma.sql`p.created_at DESC`,
            },
            {
                field: "created_at_asc",
                label: "Спочатку старіші",
                buildQuery: () => Prisma.sql`p.created_at ASC`,
            },
            {
                field: "name_asc",
                label: "За назвою: А-Я",
                buildQuery: () => Prisma.sql`p.name ASC`,
            },
            {
                field: "name_desc",
                label: "За назвою: Я-А",
                buildQuery: () => Prisma.sql`p.name DESC`,
            },
            {
                field: "rating_desc",
                label: "За рейтингом: спочатку високий",
                buildQuery: () => Prisma.sql`
                    (
                        SELECT COALESCE(AVG(rating), 0)
                        FROM comments c
                        WHERE c.product_id = p.id
                    ) DESC
                `,
            },
            {
                field: "rating_asc",
                label: "За рейтингом: спочатку низький",
                buildQuery: () => Prisma.sql`
                    (
                        SELECT COALESCE(AVG(rating), 0)
                        FROM comments c
                        WHERE c.product_id = p.id
                    ) ASC
                `,
            },
        ],
        defaultOption: "default",
        defaultDirection: "asc",
        allowDirectionChange: false,
    },
    {
        name: "secondarySort",
        title: "Додаткове сортування",
        options: [
            {
                field: "rating",
                label: "Рейтинг",
                buildQuery: () => Prisma.sql`
                    (
                        SELECT COALESCE(AVG(rating), 0)
                        FROM comments c
                        WHERE c.product_id = p.id
                    ) DESC
                `,
            },
            {
                field: "best_seller",
                label: "Хіт продажів",
                buildQuery: () => Prisma.sql`p.id DESC`,
            },
            {
                field: "new_arrivals",
                label: "Новинки",
                buildQuery: () => Prisma.sql`p.created_at DESC`,
            },
        ],
        defaultOption: "rating",
        defaultDirection: "desc",
        allowDirectionChange: false,
    },
];
