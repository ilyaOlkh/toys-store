import { ClientFilter, FilterValue } from "@/app/types/filters";
import SelectFilter from "./SelectFilter";
import { Radio } from "@mui/material";

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
            const rangeValue = (value as { from: number; to: number }) || {
                from: config.min,
                to: config.max,
            };
            return (
                <div className="flex flex-col gap-2">
                    <label className="font-medium">{config.title}</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            min={config.min}
                            max={config.max}
                            value={rangeValue.from}
                            onChange={(e) =>
                                onChange({
                                    ...rangeValue,
                                    from: Number(e.target.value),
                                })
                            }
                            className="p-2 border border-lightGray1 rounded-lg w-24"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            min={config.min}
                            max={config.max}
                            value={rangeValue.to}
                            onChange={(e) =>
                                onChange({
                                    ...rangeValue,
                                    to: Number(e.target.value),
                                })
                            }
                            className="p-2 border border-lightGray1 rounded-lg w-24"
                        />
                    </div>
                </div>
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
                <label className="flex items-center gap-2">
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
