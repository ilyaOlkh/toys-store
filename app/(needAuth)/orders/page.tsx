import { IParams } from "@/app/types/types";
import OrdersListScreen from "@/app/components/ordersList/OrdersListScreen";
import { getClientFilters, getClientSorts } from "@/app/service/orderFilters";
import { fetchFilteredOrders } from "@/app/utils/fetchFilteredOrders";
import { FilterValue, SortDirection } from "@/app/types/filters";
import { getSession } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";

export default async function UserOrders({ searchParams }: IParams) {
    const session = await getSession();

    // Получаем параметры из URL
    const urlFilters: Record<string, FilterValue> = {
        ...(searchParams?.filters
            ? JSON.parse(searchParams.filters as string)
            : {}),
        // Добавляем фильтр по user_identifier текущего пользователя
        user_identifier: session?.user.sub,
    };

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
    const defaultFilters = {
        ...initialFilters.reduce<Record<string, FilterValue>>(
            (acc, filter) => ({
                ...acc,
                [filter.name]: filter.defaultValue,
            }),
            {}
        ),
        // Добавляем фильтр по user_identifier в дефолтные значения
        user_identifier: session?.user.sub,
    };

    // Подготавливаем начальные значения сортировки
    const defaultSort = {
        field: initialSorts[0]?.defaultOption || "default",
        direction: (initialSorts[0]?.defaultDirection ||
            "asc") as SortDirection,
    };

    // Используем значения из URL или дефолтные, всегда включая user_identifier
    const initialFilterValues = {
        ...(Object.keys(urlFilters).length > 0 ? urlFilters : defaultFilters),
        user_identifier: session?.user.sub,
    };
    const initialSort = urlSort || defaultSort;
    const initialSortingRuleSet = urlSortingRuleSet;

    // Получаем заказы только для текущего пользователя
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
