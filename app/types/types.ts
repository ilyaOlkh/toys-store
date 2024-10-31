import { products } from "@prisma/client";

export interface IParams {
    params: {
        id: string;
    };
    searchParams: {
        [key: string]: string;
    };
}

export interface IParams {
    params: {
        id: string;
    };
    searchParams: {
        [key: string]: string;
    };
}

export type ProductType = products & {
    imageUrl: string;
};

// export interface ProductType extends products {
//     imageUrl: string;
// }

export interface ProductDetailType {
    description: string | null;
    stock_quantity: number;
    sku_code: string;
    current_discount: number;
    images: {
        id: number;
        url: string;
    }[];
    types: {
        id: number;
        name: string;
        image: string | null;
    }[];
    tags: {
        id: number;
        name: string;
    }[];
    comments: {
        id: number;
        user_identifier: string;
        comment: string;
        rating: number;
        created_at: Date;
    }[];
    average_rating: number;
}
