import { useProducts } from "../ProductsContext";
import { filterProducts } from "@/app/redux/productsSlice";
import MobileFilters from "./MobileFilters";

export function ProductMobileFilters() {
    const { filterValues, filterConfigs, dispatch } = useProducts();

    return (
        <MobileFilters
            filterValues={filterValues}
            filterConfigs={filterConfigs}
            onFilterChange={(name, value) => {
                dispatch(filterProducts({ name, value }));
            }}
        />
    );
}
