import { ClientFilter, FilterValue } from "@/app/types/filters";
import SelectFilter from "./SelectFilter";
import { Checkbox, Radio } from "@mui/material";
import RangeSlider from "./RangeSlider";
import MultiSelectFilter from "./MultiSelectFilter";

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
                    defaultExpanded={config.defaultExpanded}
                />
            );

        case "range":
            return (
                <RangeSlider
                    config={config}
                    value={value as { from: number; to: number }}
                    onChange={onChange}
                    defaultExpanded={config.defaultExpanded}
                />
            );

        case "multi-select":
            return (
                <MultiSelectFilter
                    config={config}
                    value={value}
                    onChange={onChange}
                    defaultExpanded={config.defaultExpanded}
                />
            );

        case "toggle":
            return (
                <label className="flex items-center">
                    <Checkbox
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
