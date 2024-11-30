import { ClientFilter, FilterValue, RangeFilter } from "@/app/types/filters";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slider,
    FormLabel,
    InputBase,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";

const CURRENCY = "₴";

interface RangeSliderProps {
    config: Omit<RangeFilter, "prismaQuery">;
    value: { from: number; to: number };
    onChange: (value: FilterValue) => void;
    defaultExpanded?: boolean;
}

export default function RangeSlider({
    config,
    value,
    onChange,
    defaultExpanded,
}: RangeSliderProps) {
    const initialValue = {
        from: value?.from ?? config.min,
        to: value?.to ?? config.max,
    };

    const [range, setRange] = useState<[number, number]>([
        initialValue.from,
        initialValue.to,
    ]);

    console.log(range);

    useEffect(() => {
        if (value) {
            const typedValue = value;
            setRange([typedValue.from, typedValue.to]);
        }
    }, [value]);

    const handleChange = (_event: Event, newValue: number | number[]) => {
        const [from, to] = newValue as number[];
        setRange([from, to]);
        onChange({ from, to });
    };

    const handleInputChange =
        (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseInt(e.target.value) || 0;
            const newRange = [...range] as [number, number];
            newRange[index] = Math.max(
                config.min,
                Math.min(config.max, newValue)
            );

            if (index === 0 && newRange[0] > range[1]) {
                newRange[0] = range[1];
            } else if (index === 1 && newRange[1] < range[0]) {
                newRange[1] = range[0];
            }

            setRange(newRange);
            onChange({ from: newRange[0], to: newRange[1] });
        };

    if (config.type !== "range") return null;

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
                className="flex flex-col pt-0 px-4"
                sx={{
                    paddingLeft: 1,
                    paddingRight: 1,
                    paddingBottom: 0,
                    paddingTop: 0,
                }}
            >
                <Slider
                    value={range}
                    onChange={handleChange}
                    min={config.min}
                    max={config.max}
                    sx={{
                        "& .MuiSlider-thumb": {
                            height: 16,
                            width: 16,
                            backgroundColor: "#fff",
                            border: "2px solid #0F83B2",
                            "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0 0 0 8px rgba(15, 131, 178, 0.16)",
                            },
                        },
                        "& .MuiSlider-track": {
                            backgroundColor: "#0F83B2",
                            border: "none",
                        },
                        "& .MuiSlider-rail": {
                            backgroundColor: "#D4D4D4",
                        },
                        "& .MuiSlider-valueLabel": {
                            backgroundColor: "#0F83B2",
                        },
                    }}
                />
                <div className="flex justify-between items-center gap-2 px-1">
                    <div className="flex items-center gap-2">
                        <InputBase
                            value={range[0].toString()}
                            onChange={handleInputChange(0)}
                            type="number"
                            inputProps={{
                                min: config.min,
                                max: config.max,
                                style: { padding: 0 },
                            }}
                            sx={{
                                fontSize: "0.875rem",
                                width: "4rem",
                            }}
                        />
                        <span className="text-gray1 text-sm">{CURRENCY}</span>
                    </div>
                    <span className="text-gray1">-</span>
                    <div className="flex items-center gap-2">
                        <InputBase
                            value={range[1]}
                            onChange={handleInputChange(1)}
                            type="number"
                            inputProps={{
                                min: config.min,
                                max: config.max,
                                style: { padding: 0 },
                            }}
                            sx={{
                                fontSize: "0.875rem",
                                width: "4rem",
                            }}
                        />
                        <span className="text-gray1 text-sm">{CURRENCY}</span>
                    </div>
                </div>
            </AccordionDetails>
        </Accordion>
    );
}
