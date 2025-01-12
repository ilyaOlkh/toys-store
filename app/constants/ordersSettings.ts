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
        title: "Номер заказа",
        placeholder: "Введите номер заказа",
        buildQuery: (value: string) => ({
            rawQuery: Prisma.sql`o.id = ${parseInt(value) || 0}`,
        }),
    },
    {
        name: "status",
        type: "multi-select",
        defaultValue: [],
        title: "Статус заказа",
        options: [
            { value: "pending", label: "Ожидает обработки" },
            { value: "processing", label: "В обработке" },
            { value: "shipped", label: "Отправлен" },
            { value: "delivered", label: "Доставлен" },
            { value: "cancelled", label: "Отменен" },
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
        title: "Способ оплаты",
        options: [
            { value: "credit_card", label: "Кредитная карта" },
            { value: "credit_card_later", label: "Карта при получении" },
            { value: "cash", label: "Наличные" },
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
        title: "Только оплаченные",
        buildQuery: (value: boolean) => ({
            rawQuery: value ? Prisma.sql`o.paid = true` : Prisma.sql`TRUE`,
        }),
    },
    {
        name: "total",
        type: "range",
        defaultValue: { from: 0, to: 100000 },
        title: "Сумма заказа",
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
        title: "Сортировать по",
        options: [
            {
                field: "default",
                label: "По умолчанию",
                buildQuery: () => Prisma.sql`o.id DESC`,
            },
            {
                field: "date_desc",
                label: "По дате: сначала новые",
                buildQuery: () => Prisma.sql`o.created_at DESC`,
            },
            {
                field: "date_asc",
                label: "По дате: сначала старые",
                buildQuery: () => Prisma.sql`o.created_at ASC`,
            },
            {
                field: "total_desc",
                label: "По сумме: по убыванию",
                buildQuery: () => Prisma.sql`o.total DESC`,
            },
            {
                field: "total_asc",
                label: "По сумме: по возрастанию",
                buildQuery: () => Prisma.sql`o.total ASC`,
            },
            {
                field: "status",
                label: "По статусу",
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
