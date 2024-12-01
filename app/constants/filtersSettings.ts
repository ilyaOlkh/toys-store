import { Filter } from "../types/filters";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const serverFilters: Filter[] = [
    {
        name: "типи",
        type: "select",
        defaultValue: null,
        title: "Типи",
        options: [],
        generateValues: async () => {
            const types = await prisma.types.findMany({
                select: { name: true },
                distinct: ["name"],
            });
            return {
                options: types.map((type) => ({
                    value: type.name,
                    label: type.name,
                })),
            };
        },
        prismaQuery: (value) => ({
            types: {
                some: {
                    type: {
                        name: value,
                    },
                },
            },
        }),
        defaultExpanded: true,
    },
    {
        name: "ціна",
        type: "range",
        defaultValue: { from: 0, to: 10000 },
        title: "Ціна",
        min: 0,
        max: 10000,
        generateValues: async () => {
            const maxPrice = await prisma.products.aggregate({
                _max: { price: true },
            });
            return {
                defaultValue: {
                    from: 0,
                    to: maxPrice._max.price?.toNumber() ?? 10000,
                },
                max: maxPrice._max.price?.toNumber() ?? 10000,
            };
        },
        prismaQuery: (value) => ({
            AND: [{ price: { gte: value.from } }, { price: { lte: value.to } }],
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
        computedFields: [
            {
                name: "averageRating",
                compute: async () => {
                    // Создаем временную таблицу/представление с вычисленными средними рейтингами
                    await prisma.$executeRaw`
                        CREATE TEMPORARY TABLE IF NOT EXISTS product_ratings AS
                        SELECT 
                            product_id,
                            COALESCE(AVG(rating), 0) as avg_rating
                        FROM comments 
                        GROUP BY product_id
                    `;
                    return Prisma.sql`avg_rating`;
                },
            },
        ],
        generateValues: async () => {
            const result = await prisma.$queryRaw<[{ max_avg: number }]>`
                SELECT MAX(avg_rating) as max_avg FROM (
                    SELECT AVG(rating) as avg_rating 
                    FROM comments 
                    GROUP BY product_id
                ) as avg_ratings
            `;

            const maxAverageRating = Number(result[0]?.max_avg) || 5;

            return {
                defaultValue: {
                    from: 0,
                    to: maxAverageRating,
                },
                max: maxAverageRating,
            };
        },
        prismaQuery: (value: { from: number; to: number }) => ({
            id: {
                in: Prisma.sql`
                    SELECT p.id 
                    FROM products p
                    LEFT JOIN (
                        SELECT product_id, AVG(rating) as avg_rating
                        FROM comments
                        GROUP BY product_id
                    ) ratings ON p.id = ratings.product_id
                    WHERE COALESCE(ratings.avg_rating, 0) >= ${value.from}
                    AND COALESCE(ratings.avg_rating, 0) <= ${value.to}
                `,
            },
        }),
    },
];
