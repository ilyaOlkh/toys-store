import React from "react";
import { Control } from "react-hook-form";
import {
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    FormHelperText,
} from "@mui/material";
import { CheckoutFormData } from "@/app/zodSchema/checkoutSchema";
import { CityInput, PhoneInput, RegionInput } from "../formComponents";

interface DeliveryFormProps {
    control: Control<CheckoutFormData>;
    register: any;
    errors: any;
    deliveryMethod: string;
    onDeliveryMethodChange: (method: string) => void;
}

export const DeliveryForm = ({
    control,
    register,
    errors,
    deliveryMethod,
    onDeliveryMethodChange,
}: DeliveryFormProps) => {
    return (
        <div className="flex flex-col rounded-xl md:border md:border-lightGray1 md:p-6 p-2">
            <h2 className="text-xl md:text-2xl font-bold pb-2 md:pb-6">
                Інформація про доставку
            </h2>

            <div className="flex flex-col gap-4">
                {/* Delivery Method Selection */}
                <div className="flex flex-col gap-2">
                    <FormLabel className="font-medium">
                        Спосіб доставки
                    </FormLabel>
                    <RadioGroup
                        value={deliveryMethod}
                        onChange={(e) => onDeliveryMethodChange(e.target.value)}
                    >
                        <FormControlLabel
                            value="nova_poshta"
                            control={<Radio />}
                            label="Нова Пошта"
                        />
                        <FormControlLabel
                            value="ukr_poshta"
                            control={<Radio />}
                            label="Укрпошта"
                        />
                        <FormControlLabel
                            value="pickup"
                            control={<Radio />}
                            label="Самовивіз"
                        />
                    </RadioGroup>
                    {errors.delivery_method && (
                        <FormHelperText error>
                            {errors.delivery_method.message}
                        </FormHelperText>
                    )}
                </div>

                {/* Name Fields */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        {...register("first_name")}
                        label="Ім'я"
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        className="flex-1"
                    />
                    <TextField
                        {...register("last_name")}
                        label="Прізвище"
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        className="flex-1"
                    />
                </div>

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
                        name="state"
                        control={control}
                        label="Область"
                        error={errors.state}
                        className="flex-1"
                    />
                </div>

                {/* Address */}
                {deliveryMethod !== "pickup" && (
                    <TextField
                        {...register("delivery_address")}
                        label="Адреса доставки"
                        error={!!errors.delivery_address}
                        helperText={errors.delivery_address?.message}
                        fullWidth
                    />
                )}

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <PhoneInput
                        name="phone"
                        control={control}
                        label="Телефон"
                        error={errors.phone}
                        className="flex-1"
                    />
                    <TextField
                        {...register("email")}
                        label="Email"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        className="flex-1"
                    />
                </div>

                {/* Delivery Cost */}
                <div className="flex flex-col gap-2">
                    <FormLabel className="font-medium">
                        Вартість доставки
                    </FormLabel>
                    <RadioGroup {...register("delivery_cost")}>
                        <FormControlLabel
                            value="carrier_tariff"
                            control={<Radio />}
                            label="За тарифами перевізника"
                        />
                        <FormControlLabel
                            value="free"
                            control={<Radio />}
                            label="Безкоштовна доставка"
                        />
                    </RadioGroup>
                    {errors.delivery_cost && (
                        <FormHelperText error>
                            {errors.delivery_cost.message}
                        </FormHelperText>
                    )}
                </div>

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
