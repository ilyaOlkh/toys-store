import { z } from "zod";

export const checkoutSchema = z.object({
    firstName: z
        .string()
        .min(2, "Ім'я повинно містити мінімум 2 символи")
        .max(50, "Ім'я занадто довге"),
    lastName: z
        .string()
        .min(2, "Прізвище повинно містити мінімум 2 символи")
        .max(50, "Прізвище занадто довге"),
    address: z.string().min(5, "Введіть повну адресу"),
    city: z.string().min(2, "Назва міста повинна містити мінімум 2 символи"),
    region: z.string().min(2, "Оберіть або введіть область"),
    zipCode: z
        .string()
        .regex(/^\d{5}$/, "Поштовий індекс повинен містити 5 цифр"),
    phone: z
        .string()
        .regex(
            /^\+38\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/,
            "Введіть коректний номер телефону"
        ),
    email: z.string().email("Введіть коректний email"),
    notes: z.string().optional(),
    paymentMethod: z.enum(["credit_card", "cash"]),
    cardNumber: z
        .string()
        .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Введіть коректний номер картки")
        .optional()
        .nullable(),
    cardName: z
        .string()
        .min(2, "Введіть ім'я власника картки")
        .optional()
        .nullable(),
    cardExpiry: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Невірний формат MM/YY")
        .refine((val) => {
            if (!val) return true;
            const [month, year] = val.split("/");
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            return expiry > new Date();
        }, "Картка прострочена")
        .optional()
        .nullable(),
    cardCvc: z
        .string()
        .regex(/^\d{3}$/, "CVC повинен містити 3 цифри")
        .optional()
        .nullable(),
    useBillingAddress: z.boolean().default(false),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
