import { z } from "zod";

export const checkoutSchema = z
    .object({
        first_name: z
            .string()
            .min(2, "Ім'я повинно містити мінімум 2 символи")
            .max(50, "Ім'я занадто довге"),
        last_name: z
            .string()
            .min(2, "Прізвище повинно містити мінімум 2 символи")
            .max(50, "Прізвище занадто довге"),
        delivery_method: z.enum(["nova_poshta", "ukr_poshta", "pickup"]),

        delivery_address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),

        phone: z
            .string({
                required_error: "Номер телефону є обов'язковим",
                invalid_type_error: "Номер телефону повинен бути рядком",
            })
            .regex(
                /^\+38\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/,
                "Введіть коректний номер телефону"
            ),
        email: z.string().email("Введіть коректний email"),
        notes: z.string().optional(),

        payment_method: z.enum(["credit_card", "credit_card_later", "cash"]),

        card_name: z
            .string()
            .min(2, "Введіть ім'я власника картки")
            .optional()
            .nullable(),
    })
    .superRefine((data, ctx) => {
        // Логика для pickup
        if (data.delivery_method === "pickup") {
            return;
        }

        // Логика для ukr_poshta - полная проверка всех полей
        if (data.delivery_method === "ukr_poshta") {
            if (!data.delivery_address || data.delivery_address.length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    minimum: 5,
                    type: "string",
                    path: ["delivery_address"],
                    message: "Введіть повну адресу",
                    inclusive: true,
                });
            }

            if (!data.city || data.city.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    minimum: 2,
                    type: "string",
                    path: ["city"],
                    message: "Назва міста повинна містити мінімум 2 символи",
                    inclusive: true,
                });
            }

            if (!data.state || data.state.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    minimum: 2,
                    type: "string",
                    path: ["state"],
                    message: "Оберіть або введіть область",
                    inclusive: true,
                });
            }
        }

        // Логика для nova_poshta - без проверки state
        if (data.delivery_method === "nova_poshta") {
            if (!data.delivery_address || data.delivery_address.length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    minimum: 5,
                    type: "string",
                    path: ["delivery_address"],
                    message: "Введіть повну адресу",
                    inclusive: true,
                });
            }

            if (!data.city || data.city.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    minimum: 2,
                    type: "string",
                    path: ["city"],
                    message: "Назва міста повинна містити мінімум 2 символи",
                    inclusive: true,
                });
            }
        }
    });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
