"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Button,
    FormControl,
    FormHelperText,
} from "@mui/material";
import {
    checkoutSchema,
    type CheckoutFormData,
} from "../zodSchema/checkoutSchema";
import {
    PhoneInput,
    CityInput,
    RegionInput,
    CardNumberInput,
    CardExpiryInput,
    CardCvcInput,
} from "../components/formComponents";
import { popularCities } from "../constants/addressConstants";
import Image from "next/image";

export default function CheckoutForm() {
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: "credit_card",
            useBillingAddress: false,
            phone: "+38",
        },
    });

    const paymentMethod = watch("paymentMethod");
    const city = watch("city");

    // Загрузка сохраненной формы из localStorage
    useEffect(() => {
        const savedForm = localStorage.getItem("checkoutForm");
        if (savedForm) {
            const parsedForm = JSON.parse(savedForm);
            reset(parsedForm);
        }
    }, [reset]);

    // Сохранение формы в localStorage при изменении
    useEffect(() => {
        if (isDirty) {
            const formData = watch();
            localStorage.setItem("checkoutForm", JSON.stringify(formData));
        }
    }, [watch, isDirty]);

    // Автозаполнение области при выборе города
    useEffect(() => {
        if (city) {
            const cityData = popularCities.find((c) => c.name === city);
            if (cityData) {
                setValue("region", cityData.region);
            }
        }
    }, [city, setValue]);

    const onSubmit = (data: CheckoutFormData) => {
        console.log(data);
        // Очистка localStorage после успешной отправки
        localStorage.removeItem("checkoutForm");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            {/* Delivery Info Section */}
            <div className="flex flex-col rounded-xl border border-lightGray1 p-6">
                <h2 className="text-2xl font-bold pb-6">
                    Інформація про доставку
                </h2>

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

            {/* Payment Section */}
            <div className="flex flex-col rounded-xl border border-lightGray1 p-6">
                <h2 className="text-2xl font-bold pb-6">Оплата</h2>
                <p className="text-gray1 pb-6">
                    Всі транзакції захищені та зашифровані.
                </p>

                <FormControl error={!!errors.paymentMethod}>
                    <RadioGroup
                        {...register("paymentMethod")}
                        defaultValue="credit_card"
                    >
                        <FormControlLabel
                            value="credit_card"
                            control={<Radio />}
                            label={
                                <div className="flex items-center gap-2">
                                    Кредитна картка
                                    <div className="flex gap-2">
                                        <Image
                                            src="/payment/visa.svg"
                                            alt="Visa"
                                            width={32}
                                            height={20}
                                        />
                                        <Image
                                            src="/payment/mastercard.svg"
                                            alt="Mastercard"
                                            width={32}
                                            height={20}
                                        />
                                        <Image
                                            src="/payment/amex.svg"
                                            alt="Amex"
                                            width={32}
                                            height={20}
                                        />
                                    </div>
                                </div>
                            }
                        />
                        <FormControlLabel
                            value="cash"
                            control={<Radio />}
                            label="Готівка"
                        />
                    </RadioGroup>
                    {errors.paymentMethod && (
                        <FormHelperText>
                            {errors.paymentMethod.message}
                        </FormHelperText>
                    )}
                </FormControl>

                {paymentMethod === "credit_card" && (
                    <div className="flex flex-col gap-4 pt-6">
                        <CardNumberInput
                            name="cardNumber"
                            control={control}
                            label="Номер картки"
                            error={errors.cardNumber}
                            fullWidth
                        />
                        <TextField
                            {...register("cardName")}
                            label="Ім'я на картці"
                            error={!!errors.cardName}
                            helperText={errors.cardName?.message}
                            fullWidth
                        />
                        <div className="flex gap-4">
                            <CardExpiryInput
                                name="cardExpiry"
                                control={control}
                                label="MM/YY"
                                error={errors.cardExpiry}
                                className="flex-1"
                            />
                            <CardCvcInput
                                name="cardCvc"
                                control={control}
                                label="CVC"
                                error={errors.cardCvc}
                                className="flex-1"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 pt-6">
                    <FormControlLabel
                        control={
                            <Checkbox {...register("useBillingAddress")} />
                        }
                        label="Використовувати адресу доставки як платіжну адресу"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                    mt: 3,
                    bgcolor: "#0F83B2",
                    "&:hover": {
                        bgcolor: "#0C698E",
                    },
                }}
            >
                Оформити замовлення
            </Button>
        </form>
    );
}
