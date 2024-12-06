import { fetchProducts } from "@/app/utils/fetch";
import { IParams } from "../types/types";
import ProductsListScreen from "../components/productsList/ProductsListScreen";
import { ProductsStoreProvider } from "../components/ProductsContext";
import { getClientFilters, getClientSorts } from "../service/filters";

export const dynamic = "force-dynamic";

export default async function products(params: IParams) {
    const initialProducts = await fetchProducts();
    const initialFilters = await getClientFilters();
    const initialSorts = await getClientSorts();

    return (
        <ProductsListScreen
            initialProducts={initialProducts}
            initialFilters={initialFilters}
            initialSortConfig={initialSorts[0]}
            initialSortingRuleSet="mainSort"
        />
    );
}
