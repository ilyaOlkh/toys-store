import { IParams } from "@/app/types/types";
import OrdersListScreen from "@/app/components/ordersList/OrdersListScreen";
import { getClientFilters, getClientSorts } from "@/app/service/orderFilters";
import { fetchFilteredOrders } from "@/app/utils/fetchFilteredOrders";
import { FilterValue, SortDirection } from "@/app/types/filters";

export const dynamic = "force-dynamic";

export default async function AdminOrders({ searchParams }: IParams) {
    // Получаем параметры из URL
    const urlFilters: Record<string, FilterValue> = searchParams?.filters
        ? JSON.parse(searchParams.filters as string)
        : {};
    const urlSort = searchParams?.sort
        ? JSON.parse(searchParams.sort as string)
        : null;
    const urlSortingRuleSet = searchParams?.sortingRuleSet || "mainSort";

    const urlLimit = searchParams?.limit
        ? parseInt(searchParams.limit as string)
        : Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE);
    const urlOffset = searchParams?.offset
        ? parseInt(searchParams.offset as string)
        : 0;

    // Получаем конфигурации фильтров и сортировки
    const [initialFilters, initialSorts] = await Promise.all([
        getClientFilters(),
        getClientSorts(),
    ]);

    // Подготавливаем начальные значения фильтров
    const defaultFilters = initialFilters.reduce<Record<string, FilterValue>>(
        (acc, filter) => ({
            ...acc,
            [filter.name]: filter.defaultValue,
        }),
        {}
    );

    // Подготавливаем начальные значения сортировки
    const defaultSort = {
        field: initialSorts[0]?.defaultOption || "default",
        direction: (initialSorts[0]?.defaultDirection ||
            "asc") as SortDirection,
    };

    // Используем значения из URL или дефолтные
    const initialFilterValues =
        Object.keys(urlFilters).length > 0 ? urlFilters : defaultFilters;
    const initialSort = urlSort || defaultSort;
    const initialSortingRuleSet = urlSortingRuleSet;

    // Получаем все заказы для админа
    const [orders, total] = await fetchFilteredOrders(
        initialFilterValues,
        initialSort,
        initialSortingRuleSet,
        { limit: urlLimit, offset: urlOffset }
    );

    return (
        <div className="py-4">
            <OrdersListScreen
                initialOrders={orders}
                initialFilters={initialFilters}
                initialSortConfig={initialSorts[0]}
                initialSortingRuleSet={initialSortingRuleSet}
                initialFilterValues={initialFilterValues}
                initialSort={initialSort}
                total={total}
                limit={urlLimit}
                offset={urlOffset}
            />
        </div>
    );
}
