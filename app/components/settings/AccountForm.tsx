"use client";
import React, { useState } from "react";
import { TextField, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneInput } from "../formComponents";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useAppDispatch } from "@/app/redux/hooks";
import { updateUserProfile } from "@/app/redux/userSlice";

const accountSchema = z.object({
    firstName: z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
    lastName: z.string().min(2, "Прізвище повинно містити мінімум 2 символи"),
    phone: z
        .string()
        .regex(
            /^\+38\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/,
            "Введіть коректний номер телефону"
        ),
    orderEmail: z.string().email("Введіть коректний email"),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function AccountForm({
    initialData = {
        firstName: "",
        lastName: "",
        phone: "",
        orderEmail: "",
    },
}: {
    initialData?: Partial<AccountFormData>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const notifications = useNotifications();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: initialData,
    });

    const onSubmit = async (data: AccountFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/user/update-profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    orderEmail: data.orderEmail,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            dispatch(
                updateUserProfile({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    orderEmail: data.orderEmail,
                })
            );

            notifications.show("Профіль успішно оновлено", {
                severity: "success",
                autoHideDuration: 5000,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            notifications.show("Помилка при оновленні профілю", {
                severity: "error",
                autoHideDuration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border border-lightGray1 p-5 rounded-2xl flex flex-col w-full max-w-xl justify-between">
            <div className="text-lg font-bold pb-4">Особисті дані</div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        {...register("firstName")}
                        label="Ім'я"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        fullWidth
                        disabled={isSubmitting}
                    />
                    <TextField
                        {...register("lastName")}
                        label="Прізвище"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        fullWidth
                        disabled={isSubmitting}
                    />
                </div>
                <PhoneInput
                    name="phone"
                    control={control}
                    label="Телефон"
                    error={errors.phone}
                    className="flex-1"
                    disabled={isSubmitting}
                />
                <TextField
                    {...register("orderEmail")}
                    label="Email для замовлень"
                    type="email"
                    error={!!errors.orderEmail}
                    helperText={errors.orderEmail?.message}
                    className="flex-1"
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue1 text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors self-start disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && (
                        <CircularProgress size={20} className="text-white" />
                    )}
                    {isSubmitting ? "Збереження..." : "Зберегти зміни"}
                </button>
            </form>
        </div>
    );
}
