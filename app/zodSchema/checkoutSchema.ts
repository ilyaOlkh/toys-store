import { z } from "zod";

export const checkoutSchema = z.object({
    first_name: z
        .string()
        .min(2, "Ім'я повинно містити мінімум 2 символи")
        .max(50, "Ім'я занадто довге"),
    last_name: z
        .string()
        .min(2, "Прізвище повинно містити мінімум 2 символи")
        .max(50, "Прізвище занадто довге"),
    delivery_address: z.string().min(5, "Введіть повну адресу"),
    city: z.string().min(2, "Назва міста повинна містити мінімум 2 символи"),
    state: z.string().min(2, "Оберіть або введіть область"),
    phone: z
        .string()
        .regex(
            /^\+38\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/,
            "Введіть коректний номер телефону"
        ),
    email: z.string().email("Введіть коректний email"),
    notes: z.string().optional(),

    // Методы оплаты и доставки
    payment_method: z.enum(["credit_card", "credit_card_later", "cash"]),
    delivery_method: z.enum(["nova_poshta", "ukr_poshta", "pickup"]),
    delivery_cost: z.enum(["carrier_tariff", "free"]),

    // Информация о карте (только если метод оплаты - кредитная карта)
    card_name: z
        .string()
        .min(2, "Введіть ім'я власника картки")
        .optional()
        .nullable(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
