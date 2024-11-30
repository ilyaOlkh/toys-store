import { FilterValue } from "../types/filters";
import { ProductType } from "../types/types";

export async function fetchFilteredProducts(
    filters: Record<string, FilterValue>
): Promise<{
    products: ProductType[];
    total: number;
}> {
    try {
        const params = new URLSearchParams();
        if (Object.keys(filters).length > 0) {
            params.append("filters", JSON.stringify(filters));
        }

        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL
            }/api/products/filtered?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            products: data.products,
            total: data.total,
        };
    } catch (error) {
        console.error("Error fetching filtered products:", error);
        return {
            products: [],
            total: 0,
        };
    }
}
