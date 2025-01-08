import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mui/material";
import {
    useStripe,
    useElements,
    CardNumberElement,
} from "@stripe/react-stripe-js";
import {
    checkoutSchema,
    type CheckoutFormData,
} from "../../zodSchema/checkoutSchema";
import { DeliveryForm } from "./DeliveryForm";
import { popularCities } from "@/app/constants/addressConstants";
import { StripePaymentForm } from "./PaymentForms";
import { useNotifications } from "@toolpad/core/useNotifications";
import { createPaymentIntent } from "@/app/order/page";
import { useAppSelector } from "@/app/redux/hooks";
import { selectActiveCartItems } from "@/app/redux/cartSelectors";
import { ProductType } from "@/app/types/types";
import { CartItem } from "@/app/redux/cartSlice";

export default function CheckoutForm() {
    const [isLoading, setLoading] = useState(false);

    const stripe = useStripe();
    const elements = useElements();
    const notifications = useNotifications();

    const cartProducts = useAppSelector((state) => state.cart.cartProducts);
    const cartItems = useAppSelector(selectActiveCartItems);

    const cartItemsWithProducts = useMemo(
        () =>
            cartItems
                .map((item) => {
                    const product = cartProducts.find(
                        (p) => p.id === item.product_id
                    );
                    if (!product) return null;
                    return {
                        ...product,
                        quantity: item.quantity,
                    };
                })
                .filter(
                    (item): item is ProductType & CartItem => item !== null
                ),
        [cartItems, cartProducts]
    );

    const savedForm = JSON.parse(localStorage.getItem("checkoutForm") ?? "{}");

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: savedForm,
    });

    const paymentMethod = watch("paymentMethod");
    const city = watch("city");

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

        setLoading(true);

        try {
            const { error: cardError, paymentMethod } =
                await stripe.createPaymentMethod({
                    type: "card",
                    card: elements.getElement(CardNumberElement)!,
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
                });

            if (cardError) {
                notifications.show(`Помилка картки: ${cardError.message}`, {
                    severity: "error",
                    autoHideDuration: 5000,
                });
                throw new Error(cardError.message);
            }
            const clientSecret = (
                await createPaymentIntent(cartItemsWithProducts)
            ).clientSecret;
            const { error: confirmError } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: paymentMethod.id,
                }
            );

            if (confirmError) {
                notifications.show(`Помилка оплати: ${confirmError.message}`, {
                    severity: "error",
                    autoHideDuration: 5000,
                });
                throw new Error(confirmError.message);
            }

            notifications.show(
                "Оплата пройшла успішно! Дякуємо за замовлення.",
                {
                    severity: "success",
                    autoHideDuration: 5000,
                }
            );

            localStorage.removeItem("checkoutForm");
        } catch (error) {
            console.error("Payment error:", error);
            if (error instanceof Error) {
                notifications.show(`Помилка оплати: ${error.message}`, {
                    severity: "error",
                    autoHideDuration: 5000,
                });
            } else {
                notifications.show("Виникла невідома помилка при оплаті", {
                    severity: "error",
                    autoHideDuration: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
            onChange={() => {
                const formData = watch();
                localStorage.setItem("checkoutForm", JSON.stringify(formData));
            }}
        >
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
                disabled={!stripe || !elements || isLoading}
                fullWidth
                sx={{
                    mt: 0,
                    bgcolor: "#0F83B2",
                    "&:hover": {
                        bgcolor: "#0C698E",
                    },
                }}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        Оформлення...
                        <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </span>
                ) : (
                    "Оформити замовлення"
                )}
            </Button>
        </form>
    );
}
