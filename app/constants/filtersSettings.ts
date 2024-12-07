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
        prismaQuery: (values: string[]) => ({
            types: {
                some: {
                    type: {
                        name: {
                            in: values,
                        },
                    },
                },
            },
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
            const tags = await prisma.tags.findMany({
                select: { name: true },
                orderBy: { name: "asc" },
            });
            return {
                options: tags.map((tag) => ({
                    value: tag.name,
                    label: tag.name,
                })),
            };
        },
        prismaQuery: (values: string[]) => ({
            tags: {
                some: {
                    tag: {
                        name: {
                            in: values,
                        },
                    },
                },
            },
        }),
        defaultExpanded: true,
    },
    {
        name: "stock",
        type: "toggle",
        defaultValue: false,
        title: "Тільки в наявності",
        prismaQuery: (value: boolean) =>
            value ? { stock_quantity: { gt: 0 } } : {},
    },
    {
        name: "discounted",
        type: "toggle",
        defaultValue: false,
        title: "Зі знижкою",
        prismaQuery: (value: boolean) =>
            value
                ? {
                      discounts: {
                          some: {
                              AND: [
                                  { start_date: { lte: new Date() } },
                                  { end_date: { gte: new Date() } },
                              ],
                          },
                      },
                  }
                : {},
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

export const serverSorts: SortConfig[] = [
    {
        name: "mainSort",
        title: "Сортувати за",
        options: [
            {
                field: "default",
                label: "За замовчуванням",
                prismaSort: () => ({ id: "asc" }),
            },
            {
                field: "price_asc",
                label: "Ціною: від дешевших до дорожчих",
                prismaSort: () => ({ price: "asc" }),
            },
            {
                field: "price_desc",
                label: "Ціною: від дорожчих до дешевших",
                prismaSort: () => ({ price: "desc" }),
            },
            {
                field: "created_at_desc",
                label: "Спочатку новіші",
                prismaSort: () => ({ created_at: "desc" }),
            },
            {
                field: "created_at_asc",
                label: "Спочатку старіші",
                prismaSort: () => ({ created_at: "asc" }),
            },
            {
                field: "name_asc",
                label: "За назвою: А-Я",
                prismaSort: () => ({ name: "asc" }),
            },
            {
                field: "name_desc",
                label: "За назвою: Я-А",
                prismaSort: () => ({ name: "desc" }),
            },
            {
                field: "rating_desc",
                label: "За рейтингом: спочатку високий",
                prismaSort: () => ({ id: "desc" }),
                sort: (a: any, b: any) => {
                    const aRating = a.comments?.length
                        ? a.comments.reduce(
                              (sum: number, comment: any) =>
                                  sum + comment.rating,
                              0
                          ) / a.comments.length
                        : 0;
                    const bRating = b.comments?.length
                        ? b.comments.reduce(
                              (sum: number, comment: any) =>
                                  sum + comment.rating,
                              0
                          ) / b.comments.length
                        : 0;
                    return bRating - aRating;
                },
            },
            {
                field: "rating_asc",
                label: "За рейтингом: спочатку низький",
                prismaSort: () => ({ id: "asc" }),
                sort: (a: any, b: any) => {
                    const aRating = a.comments?.length
                        ? a.comments.reduce(
                              (sum: number, comment: any) =>
                                  sum + comment.rating,
                              0
                          ) / a.comments.length
                        : 0;
                    const bRating = b.comments?.length
                        ? b.comments.reduce(
                              (sum: number, comment: any) =>
                                  sum + comment.rating,
                              0
                          ) / b.comments.length
                        : 0;
                    return aRating - bRating;
                },
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
                field: "none",
                label: "Не використовувати",
            },
            {
                field: "stock_quantity",
                label: "Наявністю",
                prismaSort: (direction) => ({ stock_quantity: direction }),
            },
            {
                field: "sales_count",
                label: "Популярністю",
                computed: true,
                computedFields: [
                    {
                        name: "salesCount",
                        compute: async () => {
                            await prisma.$executeRaw`
                                CREATE TEMPORARY TABLE IF NOT EXISTS product_sales AS
                                SELECT 
                                    product_id,
                                    COUNT(*) as sales_count
                                FROM orders_products 
                                GROUP BY product_id
                            `;
                            return Prisma.sql`sales_count`;
                        },
                    },
                ],
                prismaSort: (direction) => ({
                    id: direction,
                }),
            },
        ],
        defaultOption: "none",
        defaultDirection: "desc",
        allowDirectionChange: false,
    },
];
