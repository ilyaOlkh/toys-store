import { fetchProducts } from "@/app/utils/fetch";
import { IParams } from "../types/types";
import ProductsListScreen from "../components/productsList/ProductsListScreen";
import { getClientFilters, getClientSorts } from "../service/filters";
import { fetchFilteredProducts } from "../utils/fetchFilteredProducts";
import { FilterValue, SortDirection } from "../types/filters";

export const dynamic = "force-dynamic";

export default async function Products({ searchParams }: IParams) {
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

    // Получаем продукты с учетом начальных фильтров, сортировки, лимита и фасетов
    const [products, total] = await fetchFilteredProducts(
        initialFilterValues,
        initialSort,
        initialSortingRuleSet,
        { limit: urlLimit, offset: urlOffset }
    );

    return (
        <div className="py-4">
            <ProductsListScreen
                initialProducts={products}
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
