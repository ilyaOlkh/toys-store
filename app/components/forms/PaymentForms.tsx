import React from "react";
import { Control } from "react-hook-form";
import {
    TextField,
    FormControl,
    FormControlLabel,
    Radio,
    FormHelperText,
    Checkbox,
    RadioGroup,
} from "@mui/material";
import Image from "next/image";
import { CheckoutFormData } from "@/app/zodSchema/checkoutSchema";
import {
    CardNumberInput,
    CardExpiryInput,
    CardCvcInput,
} from "../formComponents";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";

interface StripePaymentFormProps {
    register: any;
    errors: any;
    paymentMethod: "credit_card" | "cash";
}

interface PaymentMethodProps {
    control: Control<CheckoutFormData>;
    register: any;
    errors: any;
    paymentMethod: "credit_card" | "cash";
}

export const CreditCardForm = ({
    control,
    register,
    errors,
}: PaymentMethodProps) => {
    return (
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
    );
};

// Компонент формы оплаты наличными
export const CashForm = () => {
    return (
        <div className="pt-6 text-gray1">
            <p>Оплата готівкою при отриманні замовлення.</p>
            <p className="mt-2">
                Будь ласка, підготуйте точну суму для зручності оплати.
            </p>
        </div>
    );
};

export const StripePaymentForm = ({
    register,
    errors,
    paymentMethod,
}: StripePaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <div className="flex flex-col rounded-xl border border-lightGray1 p-6">
            <h2 className="text-2xl font-bold pb-6">Оплата</h2>
            <AnimatePresence>
                {paymentMethod === "credit_card" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                    >
                        <p className="text-gray1 pb-6">
                            Всі транзакції захищені та зашифровані.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <FormControl error={!!errors.paymentMethod}>
                <RadioGroup
                    {...register("paymentMethod")}
                    defaultValue="credit_card"
                >
                    <FormControlLabel
                        value="credit_card"
                        control={<Radio />}
                        label="Кредитна картка"
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

            <AnimatePresence>
                {paymentMethod === "credit_card" ? (
                    <motion.div
                        key="credit_card"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden", padding: "3px" }}
                    >
                        <div className="flex flex-col gap-4 pt-6">
                            <TextField
                                {...register("cardName")}
                                label="Ім'я власника картки"
                                error={!!errors.cardName}
                                helperText={errors.cardName?.message}
                                fullWidth
                            />

                            <div className="rounded-md border border-lightGray1 px-3 py-2">
                                <CardElement options={cardElementOptions} />
                            </div>

                            <p className="text-gray1 text-sm">
                                Всі транзакції захищені та зашифровані.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="cash"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden", padding: "0 4px" }}
                    >
                        <div className="pt-6 text-gray1">
                            <p>Оплата готівкою при отриманні замовлення.</p>
                            <p className="mt-2">
                                Будь ласка, підготуйте точну суму для зручності
                                оплати.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
