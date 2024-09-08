import { fetchProducts } from '@/app/utils/fetch'
import { IParams } from '../types/types'

export const dynamic = 'force-dynamic';

export default async function products(params: IParams) {
    const products = await fetchProducts();

    return (
        <div>
            {JSON.stringify(products)}
        </div>
    );
}