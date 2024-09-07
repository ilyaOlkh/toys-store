import { fetchProduct } from '@/app/utils/fetch'
import { IParams } from '../../types/types'

export const dynamic = 'force-dynamic';

export default async function product(params: IParams) {
    const id = parseInt(params.params.id);

    if (isNaN(id)) {
        return <div>Invalid product ID</div>;
    }

    const product = await fetchProduct(id);

    return (
        <div>
            {JSON.stringify(product)}
        </div>
    );
}