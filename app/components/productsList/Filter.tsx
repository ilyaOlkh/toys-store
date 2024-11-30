import { ClientFilter, FilterValue } from "@/app/types/filters";
import SelectFilter from "./SelectFilter";
import { Radio } from "@mui/material";
import RangeSlider from "./RangeSlider";

interface FilterProps {
    config: ClientFilter;
    value: FilterValue;
    onChange: (value: FilterValue) => void;
}

export function Filter({ config, value, onChange }: FilterProps) {
    switch (config.type) {
        case "select":
            return (
                <SelectFilter
                    config={config}
                    value={value}
                    onChange={onChange}
                />
            );

        case "range":
            return (
                <RangeSlider
                    config={config}
                    value={value as { from: number; to: number }}
                    onChange={onChange}
                />
            );

        case "multi-select":
            return (
                <div className="flex flex-col gap-2">
                    <label className="font-medium">{config.title}</label>
                    <div className="flex flex-col gap-1">
                        {config.options.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={(value as string[])?.includes(
                                        option.value
                                    )}
                                    onChange={(e) => {
                                        const currentValues = (value ||
                                            []) as string[];
                                        if (e.target.checked) {
                                            onChange([
                                                ...currentValues,
                                                option.value,
                                            ]);
                                        } else {
                                            onChange(
                                                currentValues.filter(
                                                    (v) => v !== option.value
                                                )
                                            );
                                        }
                                    }}
                                    className="rounded border-lightGray1"
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>
            );

        case "toggle":
            return (
                <label className="flex items-center gap-2 p-4">
                    <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => onChange(e.target.checked)}
                        className="rounded border-lightGray1"
                    />
                    {config.title}
                </label>
            );

        default:
            return null;
    }
}
