import { products } from "@prisma/client";

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
