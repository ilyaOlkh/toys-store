import { useOrders } from "../OrdersContext";
import { filterOrders } from "@/app/redux/ordersSlice";
import MobileFilters from "./MobileFilters";

export function OrderMobileFilters() {
    const { filterValues, filterConfigs, dispatch } = useOrders();

    return (
        <MobileFilters
            filterValues={filterValues}
            filterConfigs={filterConfigs}
            onFilterChange={(name, value) => {
                dispatch(filterOrders({ name, value }));
            }}
        />
    );
}
