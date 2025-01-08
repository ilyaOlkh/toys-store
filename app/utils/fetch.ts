import { products, types } from "@prisma/client";
import { ProductDetailType, ProductType } from "../types/types";
import { CartItem } from "../redux/cartSlice";
export const dynamic = "force-dynamic";

export async function fetchTypes(): Promise<types[]> {
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_URL + "/api/types"
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchProduct(
    id: number
): Promise<(ProductType & ProductDetailType) | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/products/${id}`,
            {
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
        );
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Если нет данных, возвращаем null
        if (!data) {
            return null;
        }

        // Преобразуем даты
        const formattedProduct = {
            ...data,
            created_at: new Date(data.created_at),
            comments: data.comments.map((comment: any) => ({
                ...comment,
                created_at: new Date(comment.created_at),
            })),
            // Добавляем поле imageUrl для совместимости с ProductType
            imageUrl: data.images[0]?.url || "/noPhoto.png",
            // Убеждаемся, что все числовые значения корректны
            price: Number(data.price),
            discount: Number(data.current_discount),
            stock_quantity: Number(data.stock_quantity),
            average_rating: Number(data.average_rating),
        };

        return formattedProduct;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function fetchProducts(): Promise<ProductType[]> {
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_URL + "/api/products",
            {
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchProductsByIds(
    ids: number[]
): Promise<ProductType[]> {
    if (ids.length === 0) {
        console.error("No IDs provided");
        return [];
    }

    const idsString = ids.join(",");

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/products/ids?ids=${idsString}`,
            {
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchUserRoles(userId: string): Promise<any> {
    try {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_URL
            }/api/user/roles?userId=${encodeURIComponent(userId)}`, // Добавляем userId в строку запроса
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                next: {
                    revalidate:
                        Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
                },
            }
        );

        if (!response.ok) {
            throw "Failed to fetch user roles";
        }

        const data = await response.json();

        return data.roles;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        throw error;
    }
}

export const createPaymentIntent = async (
    cartItems: (ProductType & CartItem)[]
) => {
    const items = cartItems.map((item) => ({
        price_data: {
            currency: "uah",
            product_data: {
                name: item.name,
                images: [item.imageUrl],
                description: item.description,
                metadata: {
                    product_id: String(item.id),
                    sku: item.sku_code,
                },
            },
            unit_amount: Math.round(Number(item.discount || item.price) * 100),
        },
        quantity: item.quantity,
    }));

    const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });

    return await response.json();
};
