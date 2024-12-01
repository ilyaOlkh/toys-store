import { ClientFilter, FilterValue } from "@/app/types/filters";
import {
    FormLabel,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    CheckboxProps,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";

interface MultiSelectFilterProps {
    config: ClientFilter;
    value: FilterValue;
    onChange: (value: FilterValue) => void;
    defaultExpanded?: boolean;
}

const CustomCheckbox = (props: CheckboxProps) => {
    return (
        <Checkbox
            icon={
                <div className="relative w-4 h-4 text-gray-400">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-[2px] bg-current transition-transform duration-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-[2px] bg-current transition-transform duration-500" />
                    </div>
                </div>
            }
            checkedIcon={
                <div className="relative w-4 h-4 text-blue1">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-[2px] bg-current rotate-180 transition-all duration-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-[2px] bg-current transition-all duration-500 rotate-[270deg]" />
                    </div>
                </div>
            }
            {...props}
        />
    );
};

export default function MultiSelectFilter({
    config,
    value,
    onChange,
    defaultExpanded,
}: MultiSelectFilterProps) {
    const [selectedValues, setSelectedValues] = useState<string[]>(
        Array.isArray(value) ? value : []
    );

    useEffect(() => {
        setSelectedValues(Array.isArray(value) ? value : []);
    }, [value]);

    const handleChange = (optionValue: string) => {
        let newValues: string[];

        if (optionValue === "") {
            // Если нажали "Все"
            newValues = [];
        } else {
            // Если выбран конкретный элемент
            if (selectedValues.includes(optionValue)) {
                newValues = selectedValues.filter((v) => v !== optionValue);
            } else {
                newValues = [...selectedValues, optionValue];
            }
        }

        setSelectedValues(newValues);
        onChange(newValues);
    };

    if (config.type !== "multi-select") return null;

    const isAllSelected = selectedValues.length === 0;

    return (
        <Accordion defaultExpanded={defaultExpanded} elevation={0}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="hover:bg-gray-50"
            >
                <FormLabel className="font-medium text-black">
                    {config.title}
                </FormLabel>
            </AccordionSummary>
            <AccordionDetails
                className="flex flex-col gap-1 px-4"
                sx={{
                    paddingBottom: 0,
                    paddingTop: 0,
                }}
            >
                <FormControlLabel
                    control={
                        <CustomCheckbox
                            checked={isAllSelected}
                            onChange={() => handleChange("")}
                        />
                    }
                    label="Всі"
                    className="p-1 rounded-lg hover:bg-gray-50 w-full min-h-10"
                    sx={{ margin: 0 }}
                />
                {config.options.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        control={
                            <CustomCheckbox
                                checked={selectedValues.includes(option.value)}
                                onChange={() => handleChange(option.value)}
                            />
                        }
                        label={option.label}
                        className="p-1 rounded-lg hover:bg-gray-50 w-full min-h-10"
                        sx={{ margin: 0 }}
                    />
                ))}
            </AccordionDetails>
        </Accordion>
    );
}
