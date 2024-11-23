import ProductScreen from "@/app/components/productPage/productScreen";
import { IParams } from "@/app/types/types";
import { UserInfo } from "@/app/types/users";
import { fetchProduct } from "@/app/utils/fetch";
import { getProductComments } from "@/app/utils/fetchComments";
import { fetchUsersInfo } from "@/app/utils/fetchUsers";

// app/components/productPage/ProductPage.tsx (Server Component)
export default async function ProductPage(params: IParams) {
    const id = parseInt(params.params.id);

    if (isNaN(id)) {
        return <div>Invalid product ID</div>;
    }

    const product = await fetchProduct(id);
    if (!product) {
        return <div>Product not found</div>;
    }

    const reviews = await getProductComments(product.id);
    const users = await fetchUsersInfo(
        Array.from(new Set(reviews.map((review) => review.user_identifier)))
    );

    const usersInfo = users.reduce(
        (acc: Record<string, UserInfo>, user: UserInfo) => {
            acc[user.user_id] = user;
            return acc;
        },
        {}
    );

    return (
        <ProductScreen
            product={product}
            reviews={reviews}
            usersInfo={usersInfo}
        />
    );
}
