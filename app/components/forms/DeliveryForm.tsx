import React, { useEffect, useState } from "react";
import { Control } from "react-hook-form";
import {
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    Autocomplete,
} from "@mui/material";
import { CheckoutFormData } from "@/app/zodSchema/checkoutSchema";
import {
    fetchNovaPoshaCities,
    fetchNovaPoshtaWarehouses,
} from "@/app/utils/fetchNovaPost";
import {
    getAllRegions,
    getCitiesByRegion,
    getAddressesByRegionAndCity,
} from "@/app/utils/fetchYkrPost";
import { PhoneInput } from "../formComponents";

interface DeliveryFormProps {
    control: Control<CheckoutFormData>;
    register: any;
    errors: any;
    deliveryMethod: string;
    onDeliveryMethodChange: (method: string) => void;
    setValue: (key: any, value: any) => void;
}

export const DeliveryForm = ({
    control,
    register,
    errors,
    deliveryMethod,
    onDeliveryMethodChange,
    setValue,
}: DeliveryFormProps) => {
    const [novaPoshaCities, setNovaPoshaCities] = useState<string[]>([]);
    const [novaPoshtaAddresses, setNovaPoshtaAddresses] = useState<string[]>(
        []
    );
    const [ukrPoshtaRegions, setUkrPoshtaRegions] = useState<string[]>([]);
    const [ukrPoshtaCities, setUkrPoshtaCities] = useState<string[]>([]);
    const [ukrPoshtaAddresses, setUkrPoshtaAddresses] = useState<string[]>([]);

    // Load all initial data on component mount
    useEffect(() => {
        // Load Ukr Poshta data
        const regions = getAllRegions();
        setUkrPoshtaRegions(regions);

        // Pre-load cities for Nova Poshta popular cities
        const loadPopularCities = async () => {
            try {
                const cities = await fetchNovaPoshaCities();
                setNovaPoshaCities(cities.map((city) => city.Description));
            } catch (error) {
                console.error(
                    "Error fetching popular Nova Poshta cities:",
                    error
                );
            }
        };

        loadPopularCities();
    }, []);

    // Handle Nova Poshta city search
    const handleNovaPoshtaSearch = async (query: string) => {
        try {
            const cities = await fetchNovaPoshaCities({
                searchQuery: query,
            });
            setNovaPoshaCities(cities.map((city) => city.Description));
        } catch (error) {
            console.error("Error fetching Nova Poshta cities:", error);
        }
    };

    // Handlers for different delivery methods
    const handleNovaPoshtaCityChange = async (city: string | null) => {
        if (city) {
            try {
                const addresses = await fetchNovaPoshtaWarehouses({
                    cityName: city,
                });
                setNovaPoshtaAddresses(addresses);
            } catch (error) {
                console.error("Error fetching Nova Poshta addresses:", error);
            }
        } else {
            setNovaPoshtaAddresses([]);
        }
    };

    const handleUkrPoshtaRegionChange = (region: string | null) => {
        if (region) {
            const cities = getCitiesByRegion(region);
            setUkrPoshtaCities(cities);
        }
        // Clear dependent fields
        setUkrPoshtaAddresses([]);
        setValue("delivery_address", "");
        setValue("city", "");
    };

    const handleUkrPoshtaCityChange = (region: string, city: string | null) => {
        if (region && city) {
            const addresses = getAddressesByRegionAndCity(region, city);
            setUkrPoshtaAddresses(addresses);
        } else {
            setUkrPoshtaAddresses([]);
            setValue("delivery_address", "");
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl md:border md:border-lightGray1 md:p-6">
            {/* Base Fields */}
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

            {/* Delivery Method Selection */}
            <div>
                <FormLabel className="font-medium">Спосіб доставки</FormLabel>
                <RadioGroup
                    value={deliveryMethod}
                    onChange={(e) => onDeliveryMethodChange(e.target.value)}
                >
                    <FormControlLabel
                        value="nova_poshta"
                        control={<Radio {...register("delivery_method")} />}
                        label="Нова Пошта"
                    />
                    <FormControlLabel
                        value="ukr_poshta"
                        control={<Radio {...register("delivery_method")} />}
                        label="Укрпошта"
                    />
                    <FormControlLabel
                        value="pickup"
                        control={<Radio {...register("delivery_method")} />}
                        label="Самовивіз"
                    />
                </RadioGroup>
            </div>

            {/* Location Fields */}
            {deliveryMethod !== "pickup" && (
                <div className="flex flex-col gap-4">
                    {/* Region/Oblast Field - only for Ukr Poshta */}
                    {deliveryMethod === "ukr_poshta" && (
                        <Autocomplete
                            freeSolo
                            options={ukrPoshtaRegions}
                            onChange={(_, value) =>
                                handleUkrPoshtaRegionChange(value)
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    {...register("state")}
                                    autoComplete={false}
                                    label="Область"
                                    error={!!errors.state}
                                    helperText={errors.state?.message}
                                />
                            )}
                        />
                    )}

                    {/* City Field */}
                    <Autocomplete
                        freeSolo
                        options={
                            deliveryMethod === "nova_poshta"
                                ? novaPoshaCities
                                : ukrPoshtaCities
                        }
                        onInputChange={(_, value) => {
                            if (deliveryMethod === "nova_poshta") {
                                handleNovaPoshtaSearch(value);
                                handleNovaPoshtaCityChange(value);
                            } else if (deliveryMethod === "ukr_poshta") {
                                const region = (
                                    document.querySelector(
                                        '[name="state"]'
                                    ) as HTMLInputElement
                                )?.value;
                                handleUkrPoshtaCityChange(region, value);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                {...register("city")}
                                autoComplete={false}
                                label="Місто"
                                error={!!errors.city}
                                helperText={errors.city?.message}
                            />
                        )}
                    />

                    {/* Address Field */}
                    <Autocomplete
                        freeSolo
                        options={
                            deliveryMethod === "nova_poshta"
                                ? novaPoshtaAddresses
                                : ukrPoshtaAddresses
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                {...register("delivery_address")}
                                autoComplete={false}
                                label="Адреса"
                                error={!!errors.delivery_address}
                                helperText={errors.delivery_address?.message}
                            />
                        )}
                    />
                </div>
            )}

            {/* Contact Fields */}
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

            {/* Notes Field */}
            <TextField
                {...register("notes")}
                label="Примітки до замовлення (необов'язково)"
                multiline
                rows={4}
                error={!!errors.notes}
                helperText={errors.notes?.message}
            />
        </div>
    );
};
