import { products, types } from "@prisma/client";
export const dynamic = 'force-dynamic';

export async function fetchTypes(): Promise<types[]> {
    try {
        const response = await fetch(process.env.URL + '/api/types');
        const data = await response.json();
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function fetchProduct(id: number): Promise<products[]> {
    try {
        const response = await fetch(process.env.URL + '/api/products/' + id);
        const data = await response.json();
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}