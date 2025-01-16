import { Filter, SortConfig } from "../types/filters";
import {
    Prisma,
    PrismaClient,
    payment_method,
    order_status,
} from "@prisma/client";

const prisma = new PrismaClient();

export const serverFilters: Filter[] = [
    {
        name: "order_id",
        type: "input",
        defaultValue: "",
        title: "Номер замовлення",
        placeholder: "Введіть номер замовлення",
        buildQuery: (value: string) => ({
            rawQuery: Prisma.sql`o.id = ${parseInt(value) || 0}`,
        }),
    },
    {
        name: "status",
        type: "multi-select",
        defaultValue: [],
        title: "Статус замовлення",
        options: [
            { value: "pending", label: "Очікує обробки" },
            { value: "processing", label: "В обробці" },
            { value: "shipped", label: "Відправлено" },
            { value: "delivered", label: "Доставлено" },
            { value: "cancelled", label: "Відмінено" },
        ],
        buildQuery: (values: payment_method[]) => ({
            rawQuery: values.length
                ? Prisma.sql`o.status IN (${Prisma.join(values)})`
                : Prisma.sql`TRUE`,
        }),
        defaultExpanded: true,
    },
    {
        name: "payment_method",
        type: "select",
        defaultValue: null,
        title: "Спосіб оплати",
        options: [
            { value: "credit_card", label: "Кредитна картка" },
            { value: "credit_card_later", label: "Картка при отриманні" },
            { value: "cash", label: "Готівка" },
        ],
        buildQuery: (value: order_status | null) => ({
            rawQuery: value
                ? Prisma.sql`o.payment_method = ${value}`
                : Prisma.sql`TRUE`,
        }),
    },
    {
        name: "paid",
        type: "toggle",
        defaultValue: false,
        title: "Тільки оплачені",
        buildQuery: (value: boolean) => ({
            rawQuery: value ? Prisma.sql`o.paid = true` : Prisma.sql`TRUE`,
        }),
    },
    {
        name: "total",
        type: "range",
        defaultValue: { from: 0, to: 100000 },
        title: "Сума замовлення",
        min: 0,
        max: 100000,
        unit: {
            symbol: "₴",
            position: "suffix",
        },
        generateValues: async () => {
            const result = await prisma.$queryRaw<[{ max_total: number }]>`
               SELECT MAX(total) as max_total FROM orders
           `;
            const maxTotal = Number(result[0]?.max_total) ?? 100000;
            return {
                defaultValue: { from: 0, to: maxTotal },
                max: maxTotal,
            };
        },
        buildQuery: (value: { from: number; to: number }) => ({
            rawQuery: Prisma.sql`o.total BETWEEN ${value.from} AND ${value.to}`,
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
                buildQuery: () => Prisma.sql`o.id DESC`,
            },
            {
                field: "date_desc",
                label: "За датою: спочатку нові",
                buildQuery: () => Prisma.sql`o.created_at DESC`,
            },
            {
                field: "date_asc",
                label: "За датою: спочатку старі",
                buildQuery: () => Prisma.sql`o.created_at ASC`,
            },
            {
                field: "total_desc",
                label: "За сумою: за спаданням",
                buildQuery: () => Prisma.sql`o.total DESC`,
            },
            {
                field: "total_asc",
                label: "За сумою: за зростанням",
                buildQuery: () => Prisma.sql`o.total ASC`,
            },
            {
                field: "status",
                label: "За статусом",
                buildQuery: () => Prisma.sql`
                   CASE o.status
                       WHEN 'pending' THEN 1
                       WHEN 'processing' THEN 2 
                       WHEN 'shipped' THEN 3
                       WHEN 'delivered' THEN 4
                       WHEN 'cancelled' THEN 5
                   END ASC
               `,
            },
        ],
        defaultOption: "default",
        defaultDirection: "desc",
        allowDirectionChange: false,
    },
];
