import React from "react";
import { Control } from "react-hook-form";
import { TextField } from "@mui/material";
import { CheckoutFormData } from "@/app/zodSchema/checkoutSchema";
import { CityInput, PhoneInput, RegionInput } from "../formComponents";

interface DeliveryFormProps {
    control: Control<CheckoutFormData>;
    register: any;
    errors: any;
}

export const DeliveryForm = ({
    control,
    register,
    errors,
}: DeliveryFormProps) => {
    return (
        <div className="flex flex-col rounded-xl border border-lightGray1 p-6">
            <h2 className="text-2xl font-bold pb-6">Інформація про доставку</h2>

            <div className="flex flex-col gap-6">
                {/* Name Fields */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        {...register("firstName")}
                        label="Ім'я"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        className="flex-1"
                    />
                    <TextField
                        {...register("lastName")}
                        label="Прізвище"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        className="flex-1"
                    />
                </div>

                {/* Address */}
                <TextField
                    {...register("address")}
                    label="Адреса"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    fullWidth
                />

                {/* City & Region */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <CityInput
                        name="city"
                        control={control}
                        label="Місто"
                        error={errors.city}
                        className="flex-1"
                    />
                    <RegionInput
                        name="region"
                        control={control}
                        label="Область"
                        error={errors.region}
                        className="flex-1"
                    />
                </div>

                {/* ZIP & Phone */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        {...register("zipCode")}
                        label="Поштовий індекс"
                        error={!!errors.zipCode}
                        helperText={errors.zipCode?.message}
                        className="flex-1"
                    />
                    <PhoneInput
                        name="phone"
                        control={control}
                        label="Телефон"
                        error={errors.phone}
                        className="flex-1"
                    />
                </div>

                {/* Email */}
                <TextField
                    {...register("email")}
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                />

                {/* Notes */}
                <TextField
                    {...register("notes")}
                    label="Примітки до замовлення (необов'язково)"
                    multiline
                    rows={4}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    fullWidth
                />
            </div>
        </div>
    );
};
