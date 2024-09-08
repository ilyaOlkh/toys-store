import { products, types } from "@prisma/client";
export const dynamic = 'force-dynamic';

export async function fetchTypes(): Promise<types[]> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/types');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function fetchProduct(id: number): Promise<products[] | null> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/products/' + id);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error)
        return null
    }
}