import { fetchProducts } from "@/app/utils/fetch";
import { IParams } from "../types/types";
import ProductsListScreen from "../components/productsList/ProductsListScreen";

export const dynamic = "force-dynamic";

export default async function products(params: IParams) {
    const products = await fetchProducts();

    return <ProductsListScreen products={products} />;
}
