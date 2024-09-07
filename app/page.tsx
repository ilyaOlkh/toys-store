import { useEffect, useState } from 'react';

export const revalidate = 60;
export const dynamicParams = true;

interface ProductType {
    id: number;
    name: string;
    imageBlob: Uint8Array | null; // Если у вас нет изображений, можно заменить на `string` или `null`
}

export default async function Home() {
    async function fetchTypes(): Promise<ProductType[]> {
        try {
            const response = await fetch(process.env.URL + '/api/types');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const types = await fetchTypes()

    if (types.length === 0) return <div>Loading...</div>;

    return (
        <div>
            <h1>Product Types</h1>
            <ul>
                {types.map(type => (
                    <li key={type.id}>
                        {type.name}
                        {/* Если нужно отобразить изображения, вам нужно преобразовать их в URL или обработать соответствующим образом */}
                    </li>
                ))}
            </ul>
        </div>
    );
}