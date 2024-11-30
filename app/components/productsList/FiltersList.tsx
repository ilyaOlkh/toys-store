import { ClientFilter, FilterValue } from "@/app/types/filters";
import { Filter } from "./Filter";

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
        <div className="flex flex-col gap-4 border border-lightGray1 rounded-xl p-4">
            <h2 className="text-xl font-bold">Фільтри</h2>
            <div className="flex flex-col gap-4">
                {filterConfigs.map((config) => (
                    <Filter
                        key={config.name}
                        config={config}
                        value={filterValues[config.name] ?? config.defaultValue}
                        onChange={(value) => onFilterChange(config.name, value)}
                    />
                ))}
            </div>
        </div>
    );
}
