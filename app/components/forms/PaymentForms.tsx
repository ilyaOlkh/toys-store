import React, { useEffect, useState } from "react";
import {
    TextField,
    FormControl,
    FormControlLabel,
    Radio,
    FormHelperText,
    RadioGroup,
} from "@mui/material";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface StripePaymentFormProps {
    register: UseFormRegister<any>;
    errors: any;
    paymentMethod: "credit_card" | "credit_card_later" | "cash";
}
interface CardNumberInputProps {
    error?: boolean;
    helperText?: string;
}
interface CustomStripeInputProps {
    label: string;
    error?: boolean;
    helperText?: string;
    stripeElement: React.ReactNode;
    leftCorrectionClass?: string;
}

const CustomStripeInput = ({
    label,
    error,
    helperText,
    stripeElement,
    leftCorrectionClass,
}: CustomStripeInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const elements = useElements();

    const elementDOM: any = elements?.getElement(
        (stripeElement as any).type.__elementType
    );

    const isError = elementDOM?._parent.classList.contains(
        "StripeElement--invalid"
    );

    return (
        <FormControl
            variant="outlined"
            fullWidth
            error={error}
            className="group relative"
        >
            <div
                className={`
                    rounded-md transition-all duration-200 
                    border-2 focus-within:border-blue1
                    hover:border-blue1 px-[10px] py-2
                    ${error || isError ? "border-red-500" : "border-lightGray1"}
                    ${isFocused ? "!border-blue1" : ""}
                `}
                onMouseDown={() => {
                    const element = document.querySelector(
                        `[data-stripe="${label}"]`
                    );
                    if (element) {
                        (element as HTMLElement).focus();
                    }
                }}
                data-stripe={label}
            >
                <div className="absolute top-0 bottom-0 w-full">
                    <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none
                            text-gray-500 transition-all duration-200 origin-[4px_50%]
                            ${
                                leftCorrectionClass &&
                                !(isFocused || hasContent)
                                    ? leftCorrectionClass
                                    : "left-0"
                            }
                            ${
                                isFocused || hasContent
                                    ? "transform left-0 -translate-y-7 -translate-x-1 scale-75 text-sm bg-white pl-[3px] pr-2 origin-[6px_50%]"
                                    : ""
                            }
                            ${isFocused && !isError ? "!text-blue1" : ""}
                            ${error || isError ? "text-red-500" : ""}
                        `}
                    >
                        {label}
                    </div>
                </div>
                {React.cloneElement(stripeElement as React.ReactElement, {
                    onFocus: () => setIsFocused(true),
                    onBlur: (e: any) => {
                        console.log("Blur", e);
                        setIsFocused(false);
                    },
                    onChange: (e: any) => {
                        // alert(1);
                        console.log("change", e);
                        setHasContent(!e.empty);
                    },
                })}
            </div>
            {helperText && (
                <FormHelperText error={error}>{helperText}</FormHelperText>
            )}
        </FormControl>
    );
};

// Специализированные компоненты для каждого элемента карты
export const CustomCardNumberInput = ({
    error,
    helperText,
}: CardNumberInputProps) => (
    <CustomStripeInput
        leftCorrectionClass="left-8"
        label="Номер картки"
        error={error}
        helperText={helperText}
        stripeElement={
            <CardNumberElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#1f2937",
                            fontFamily:
                                '"Roboto", "Helvetica", "Arial", sans-serif',
                            "::placeholder": {
                                color: "transparent",
                            },
                            padding: "16.5px 14px",
                        },
                        invalid: {
                            color: "#ef4444",
                        },
                    },
                    showIcon: true,
                }}
                // onChange={(e) => setHasContent(e.complete)}
            />
        }
    />
);

export const CustomCardExpiryInput = ({
    error,
    helperText,
}: CardNumberInputProps) => (
    <CustomStripeInput
        label="Термін дії"
        error={error}
        helperText={helperText}
        stripeElement={
            <CardExpiryElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#1f2937",
                            fontFamily:
                                '"Roboto", "Helvetica", "Arial", sans-serif',
                            "::placeholder": {
                                color: "transparent",
                            },
                            padding: "16.5px 14px",
                        },
                        invalid: {
                            color: "#ef4444",
                        },
                    },
                }}
            />
        }
    />
);

export const CustomCardCvcInput = ({
    error,
    helperText,
}: CardNumberInputProps) => (
    <CustomStripeInput
        label="CVV"
        error={error}
        helperText={helperText}
        stripeElement={
            <CardCvcElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#1f2937",
                            fontFamily:
                                '"Roboto", "Helvetica", "Arial", sans-serif',
                            "::placeholder": {
                                color: "transparent",
                            },
                            padding: "16.5px 14px",
                        },
                        invalid: {
                            color: "#ef4444",
                        },
                    },
                }}
            />
        }
    />
);

export const StripePaymentForm = ({
    register,
    errors,
    paymentMethod,
}: StripePaymentFormProps) => {
    return (
        <div className="flex flex-col rounded-xl md:border md:border-lightGray1 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold pb-2 md:pb-6">
                Оплата
            </h2>

            <FormControl error={!!errors.paymentMethod}>
                <RadioGroup defaultValue="credit_card">
                    <FormControlLabel
                        value="credit_card"
                        control={<Radio {...register("payment_method")} />}
                        label="Кредитна картка зараз"
                    />
                    <FormControlLabel
                        value="credit_card_later"
                        control={<Radio {...register("payment_method")} />}
                        label="Кредитна картка при отриманні"
                    />
                    <FormControlLabel
                        value="cash"
                        control={<Radio {...register("payment_method")} />}
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
                        style={{ overflow: "hidden" }}
                    >
                        <div className="flex flex-col gap-4 pt-6">
                            <TextField
                                {...register("cardName")}
                                label="Ім'я власника картки"
                                error={!!errors.cardName}
                                helperText={errors.cardName?.message}
                                fullWidth
                            />

                            <CustomCardNumberInput
                                error={!!errors.cardNumber}
                                helperText={errors.cardNumber?.message}
                            />

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <CustomCardExpiryInput
                                        error={!!errors.cardExpiry}
                                        helperText={errors.cardExpiry?.message}
                                    />
                                </div>
                                <div className="flex-1">
                                    <CustomCardCvcInput
                                        error={!!errors.cardCvc}
                                        helperText={errors.cardCvc?.message}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {paymentMethod === "cash" && (
                            <motion.div
                                key="cash"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="pt-6 text-gray1">
                                    <p>
                                        Оплата готівкою при отриманні
                                        замовлення.
                                    </p>
                                    <p className="mt-2">
                                        Будь ласка, підготуйте точну суму для
                                        зручності оплати.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
