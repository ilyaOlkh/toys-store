import React from "react";
import {
    Autocomplete,
    TextField,
    TextFieldProps,
    AutocompleteProps,
} from "@mui/material";
import { Control, Controller, FieldError } from "react-hook-form";
import { CheckoutFormData } from "@/app/zodSchema/checkoutSchema";
import { popularCities, regions } from "../constants/addressConstants";

interface BaseControlledFieldProps {
    name: keyof CheckoutFormData;
    control: Control<CheckoutFormData>;
    error?: FieldError;
}

type ControlledTextFieldProps = Omit<TextFieldProps, "name" | "error"> &
    BaseControlledFieldProps;

export const PhoneInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    const formatPhoneNumber = (value: string) => {
        if (!value) return "+38";
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 2) return "+38";

        let formatted = "+38";
        if (digits.length > 2) formatted += ` (${digits.slice(2, 5)}`;
        if (digits.length > 5) formatted += `) ${digits.slice(5, 8)}`;
        if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
        if (digits.length > 10) formatted += `-${digits.slice(10, 12)}`;

        return formatted;
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...props}
                    {...field}
                    value={field.value || "+38"}
                    onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                    }}
                    error={!!error}
                    helperText={error?.message}
                    inputProps={{
                        maxLength: 19,
                    }}
                />
            )}
        />
    );
};

// City Input с автокомплитом и возможностью ввода своего значения
export const CityInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    freeSolo
                    options={popularCities.map((city) => city.name)}
                    value={String(field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    onInputChange={(_, newValue) => field.onChange(newValue)}
                    className="w-full"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            error={!!error}
                            helperText={error?.message}
                        />
                    )}
                />
            )}
        />
    );
};

// Region Input с автокомплитом и возможностью ввода своего значения
export const RegionInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    freeSolo
                    options={regions}
                    value={String(field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    onInputChange={(_, newValue) => field.onChange(newValue)}
                    className="w-full"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            error={!!error}
                            helperText={error?.message}
                        />
                    )}
                />
            )}
        />
    );
};

// Card Number Input с маской
export const CardNumberInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, "");
        const groups = digits.match(/.{1,4}/g) || [];
        return groups.join(" ");
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...props}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                    }}
                    error={!!error}
                    helperText={error?.message}
                    inputProps={{
                        maxLength: 19,
                    }}
                />
            )}
        />
    );
};

// Card Expiry Input с маской
export const CardExpiryInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length >= 2) {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
        }
        return digits;
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...props}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        field.onChange(formatted);
                    }}
                    error={!!error}
                    helperText={error?.message}
                    inputProps={{
                        maxLength: 5,
                    }}
                />
            )}
        />
    );
};

// Card CVC Input
export const CardCvcInput: React.FC<ControlledTextFieldProps> = ({
    name,
    control,
    error,
    ...props
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...props}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                    }}
                    error={!!error}
                    helperText={error?.message}
                    inputProps={{
                        maxLength: 3,
                    }}
                />
            )}
        />
    );
};
