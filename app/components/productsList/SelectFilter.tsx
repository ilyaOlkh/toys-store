import { ClientFilter, FilterValue } from "@/app/types/filters";
import {
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import Radio, { RadioProps } from "@mui/material/Radio";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";

interface SelectFilterProps {
    config: ClientFilter;
    value: FilterValue;
    onChange: (value: FilterValue) => void;
}

const CustomRadio = (props: RadioProps) => {
    return (
        <Radio
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
                    <div className="absolute inset-0 flex items-center justify-center ">
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

export default function SelectFilter({
    config,
    value,
    onChange,
}: SelectFilterProps) {
    const [selectedValue, setSelectedValue] = useState<FilterValue>(value);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        value: string
    ) => {
        const newValue = value === "" ? null : value;
        setSelectedValue(newValue);
        onChange(newValue);
    };

    if (config.type !== "select") return null;

    return (
        <Accordion defaultExpanded elevation={0}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="hover:bg-gray-50"
            >
                <FormLabel className="font-medium text-black">
                    {config.title}
                </FormLabel>
            </AccordionSummary>
            <AccordionDetails
                className="flex flex-col gap-1 pt-0 px-4"
                sx={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingTop: 0,
                }}
            >
                <RadioGroup
                    value={selectedValue === null ? "" : selectedValue}
                    onChange={handleChange}
                >
                    <FormControlLabel
                        value={""}
                        control={<CustomRadio />}
                        label="Всі"
                        className="p-1 rounded-lg hover:bg-gray-50 w-full min-h-10"
                        sx={{ margin: 0 }}
                    />
                    {config.options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<CustomRadio />}
                            label={option.label}
                            className="p-1 rounded-lg hover:bg-gray-50 w-full min-h-10"
                            sx={{ margin: 0 }}
                        />
                    ))}
                </RadioGroup>
            </AccordionDetails>
        </Accordion>
    );
}
