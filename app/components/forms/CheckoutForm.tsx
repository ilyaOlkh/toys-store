import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mui/material";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import {
    checkoutSchema,
    type CheckoutFormData,
} from "../../zodSchema/checkoutSchema";
import { DeliveryForm } from "./DeliveryForm";
import { popularCities } from "@/app/constants/addressConstants";
import { StripePaymentForm } from "./PaymentForms";

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

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

    const onSubmit = async (data: CheckoutFormData) => {
        if (!stripe || !elements) {
            return;
        }

        // Показываем лоадер или блокируем кнопку
        // setLoading(true);

        try {
            // Подтверждаем платеж
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }

            // Подтверждаем платеж через Stripe
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success`,
                    payment_method_data: {
                        billing_details: {
                            name: `${data.firstName} ${data.lastName}`,
                            email: data.email,
                            phone: data.phone,
                            address: {
                                city: data.city,
                                state: data.region,
                                line1: data.address,
                                postal_code: data.zipCode,
                                country: "UA",
                            },
                        },
                    },
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            // Очищаем форму и localStorage при успешной оплате
            localStorage.removeItem("checkoutForm");
        } catch (error) {
            console.error("Payment error:", error);
            // Показать ошибку пользователю
        } finally {
            // setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <DeliveryForm
                control={control}
                register={register}
                errors={errors}
            />

            <StripePaymentForm
                paymentMethod={paymentMethod}
                register={register}
                errors={errors}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={!stripe || !elements}
                fullWidth
                sx={{
                    mt: 0,
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
