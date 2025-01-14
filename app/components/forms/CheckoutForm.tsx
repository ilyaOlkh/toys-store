import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { selectActiveCartItems } from "@/app/redux/cartSelectors";
import { ProductType } from "@/app/types/types";
import { CartItem } from "@/app/redux/cartSlice";
import { createPaymentIntent } from "@/app/utils/fetch";
import { sendOrder } from "@/app/utils/sendOrder";
import { calculateDeliveryCost } from "@/app/utils/delivery";

export default function CheckoutForm() {
    const savedForm = JSON.parse(localStorage.getItem("checkoutForm") ?? "{}");

    const [isLoading, setLoading] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState(
        savedForm.delivery_method ?? "nova_poshta"
    );

    const stripe = useStripe();
    const elements = useElements();
    const notifications = useNotifications();
    const dispatch = useAppDispatch();

    const cartProducts = useAppSelector((state) => state.cart.cartProducts);
    const user = useAppSelector((state) => state.user.user);
    const cartItems = useAppSelector(selectActiveCartItems);

    const cartItemsWithProducts = useMemo(
        () =>
            cartItems
                .map((item) => {
                    const product = cartProducts.find(
                        (p) => p.id === item.product_id
                    );
                    if (!product) return null;
                    return { ...product, quantity: item.quantity };
                })
                .filter(
                    (item): item is ProductType & CartItem => item !== null
                ),
        [cartItems, cartProducts]
    );

    const cartTotal = cartItemsWithProducts.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const cartTotalWithDiscount = cartItemsWithProducts.reduce(
        (sum, item) =>
            sum + (Number(item.discount) || Number(item.price)) * item.quantity,
        0
    );

    // Объединяем данные из localStorage и Redux state
    const defaultValues = useMemo(
        () => ({
            ...{
                first_name: user?.given_name || "",
                last_name: user?.family_name || "",
                email: user?.user_metadata?.orderEmail || user?.email || "",
                phone: user?.user_metadata?.phone || "",
            },
            ...savedForm,
            delivery_method: deliveryMethod,
        }),
        [user, savedForm, deliveryMethod]
    );

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues,
    });

    const paymentMethod = watch("payment_method");
    const city = watch("city");

    useEffect(() => {
        if (city) {
            const cityData = popularCities.find((c) => c.name === city);
            if (cityData) {
                setValue("state", cityData.region);
            }
        }
    }, [city, setValue]);

    const onSubmit = async (data: CheckoutFormData) => {
        const orderId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        if (paymentMethod === "credit_card") {
            if (!stripe || !elements) return;
            setLoading(true);

            try {
                const paymentMethodResult = await stripe.createPaymentMethod({
                    type: "card",
                    card: elements.getElement(CardNumberElement)!,
                    billing_details: {
                        name: `${data.first_name} ${data.last_name}`,
                        email: data.email,
                        phone: data.phone,
                        address: {
                            city: data.city,
                            state: data.state,
                            line1: data.delivery_address,
                            country: "UA",
                        },
                    },
                });

                if (paymentMethodResult.error) {
                    throw new Error(paymentMethodResult.error.message);
                }

                const { clientSecret } = await createPaymentIntent(
                    cartItemsWithProducts
                );

                const confirmResult = await stripe.confirmCardPayment(
                    clientSecret,
                    {
                        payment_method: paymentMethodResult.paymentMethod.id,
                    }
                );

                if (confirmResult.error) {
                    throw new Error(confirmResult.error.message);
                }

                await sendOrderCallback(data, orderId, true);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Виникла помилка при оплаті";
                notifications.show(message, { severity: "error" });
                return;
            } finally {
                setLoading(false);
            }
        } else {
            await sendOrderCallback(data, orderId, false);
        }
    };

    const sendOrderCallback = useCallback(
        async (data: CheckoutFormData, orderId: string, paid: boolean) => {
            try {
                const deliveryCostResult = calculateDeliveryCost({
                    total: cartTotalWithDiscount,
                    deliveryMethod: data.delivery_method as
                        | "nova_poshta"
                        | "ukr_poshta"
                        | "pickup",
                });

                await sendOrder(
                    {
                        order_id: orderId,
                        user_identifier: user?.sub || "anonymous",
                        first_name: data.first_name,
                        last_name: data.last_name,
                        city: data.city,
                        state: data.state,
                        delivery_address: data.delivery_address,
                        delivery_method: data.delivery_method,
                        delivery_cost: deliveryCostResult.type,
                        phone: data.phone,
                        email: data.email,
                        payment_method: data.payment_method,
                        paid,
                        payment_date: paid ? new Date() : undefined,
                        notes: data.notes,
                        subtotal: cartTotal,
                        total: cartTotalWithDiscount,
                        products: cartItemsWithProducts.map((item) => ({
                            product_id: item.id,
                            quantity: item.quantity,
                            original_price: item.price,
                            purchase_price: item.discount || item.price,
                            product_name: item.name,
                            product_sku: item.sku_code,
                        })),
                    },
                    dispatch
                );

                notifications.show("Замовлення успішно створено!", {
                    severity: "success",
                });
                localStorage.removeItem("checkoutForm");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Помилка створення замовлення";
                notifications.show(message, { severity: "error" });
            }
        },
        [
            user,
            cartTotal,
            cartTotalWithDiscount,
            cartItemsWithProducts,
            dispatch,
            notifications,
        ]
    );

    return (
        <div className="flex flex-col gap-8">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8"
                onChange={() => {
                    const formData = watch();
                    localStorage.setItem(
                        "checkoutForm",
                        JSON.stringify(formData)
                    );
                }}
            >
                <DeliveryForm
                    control={control}
                    register={register}
                    errors={errors}
                    deliveryMethod={deliveryMethod}
                    onDeliveryMethodChange={setDeliveryMethod}
                    setValue={setValue}
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
                        bgcolor: "#0F83B2",
                        "&:hover": {
                            bgcolor: "#0C698E",
                        },
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <span>Оформлення...</span>
                            <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        "Оформити замовлення"
                    )}
                </Button>
            </form>
        </div>
    );
}
