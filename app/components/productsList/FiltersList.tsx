import { ClientFilter, FilterValue } from "@/app/types/filters";
import { Filter } from "./Filter";
import { Divider } from "@mui/material";

interface FiltersListProps {
    filterConfigs: ClientFilter[];
    filterValues: Record<string, FilterValue>;
    onFilterChange: (name: string, value: FilterValue) => void;
}

export function FiltersList({
    filterConfigs,
    filterValues,
    onFilterChange,
}: FiltersListProps) {
    return (
        <div className="flex flex-col border border-lightGray1 rounded-xl">
            <h2 className="text-xl font-bold p-4">Фільтри</h2>
            <div className="flex flex-col">
                {filterConfigs.map((config, index) => (
                    <div
                        key={config.name}
                        className={
                            index === filterConfigs.length - 1
                                ? "rounded-b-xl overflow-hidden"
                                : ""
                        }
                    >
                        <Filter
                            config={config}
                            value={
                                filterValues[config.name] ?? config.defaultValue
                            }
                            onChange={(value) =>
                                onFilterChange(config.name, value)
                            }
                        />
                        {index < filterConfigs.length - 1 && (
                            <Divider sx={{ my: 1 }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}