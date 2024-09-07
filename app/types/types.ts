export interface IParams {
    params: {
        id: string
    }
    searchParams: {
        [key: string]: string
    }
}

export interface ProductType {
    id: number;
    name: string;
    imageBlob: Uint8Array | null; // Если у вас нет изображений, можно заменить на `string` или `null`
}