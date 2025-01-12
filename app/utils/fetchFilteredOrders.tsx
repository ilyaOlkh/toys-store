import { FilterValue, SortDirection } from "../types/filters";
import { OrderType } from "../redux/ordersSlice";
import { cookies } from "next/headers";

interface PaginationParams {
    limit?: number;
    offset?: number;
}

export async function fetchFilteredOrders(
    filters: Record<string, FilterValue>,
    sort: { field: string; direction: SortDirection },
    sortingRuleSet: string,
    pagination?: PaginationParams
): Promise<[OrderType[], number]> {
    try {
        const cookieStore = cookies();
        const appSession = cookieStore.get("appSession")?.value;
        const params = new URLSearchParams();

        if (Object.keys(filters).length > 0) {
            params.append("filters", JSON.stringify(filters));
        }

        if (Object.keys(sort).length > 0) {
            params.append("sort", JSON.stringify(sort));
            params.append("sortingRuleSet", JSON.stringify(sortingRuleSet));
        }

        // Add pagination parameters if provided
        if (pagination?.limit !== undefined) {
            params.append("limit", pagination.limit.toString());
        }
        if (pagination?.offset !== undefined) {
            params.append("offset", pagination.offset.toString());
        }

        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_URL
            }/api/orders/filtered?${params.toString()}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `appSession=${appSession}`,
                },
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return [data.orders, data.total];
    } catch (error) {
        console.error("Error fetching filtered orders:", error);
        return [[], 0];
    }
}
