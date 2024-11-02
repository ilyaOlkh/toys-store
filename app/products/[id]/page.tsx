import { fetchProduct } from "@/app/utils/fetch";
import { IParams } from "../../types/types";
import Image from "next/image";
import { Rating } from "@mui/material";
import Price from "@/app/components/price";
import ProductGallery from "@/app/components/productPage/productGallery";
import {
    FaInstagram,
    FaTwitter,
    FaFacebook,
    FaPinterest,
} from "react-icons/fa";
import { ProductQuantityControl } from "@/app/components/productPage/ProductQuantityControl";
import ProductTabs from "@/app/components/productPage/ProductTabs";
import { getProductComments } from "@/app/utils/fetchComments";
import FavoriteButton from "@/app/components/productPage/FavoriteButton";

export const dynamic = "force-dynamic";

export default async function ProductPage(params: IParams) {
    const id = parseInt(params.params.id);

    if (isNaN(id)) {
        return <div>Invalid product ID</div>;
    }

    const product = await fetchProduct(id);

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="flex justify-center">
            <div className="customContainer py-10">
                {/* Product Info Section */}
                <div className="flex flex-col gap-12 md:flex-row">
                    {/* Gallery Section */}
                    <div className="w-full md:w-1/2">
                        <ProductGallery images={product.images} />
                    </div>

                    {/* Product Details Section */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <h1 className="text-[32px] font-bold">
                            {product.name}
                        </h1>

                        {/* Description */}
                        {product.description && (
                            <p className="text-[#898989] text-[15px] leading-[22px]">
                                {product.description}
                            </p>
                        )}

                        {/* Price */}
                        <div className="text-2xl my-2">
                            <Price
                                firstPrice={String(product.price)}
                                discountPrice={String(product.current_discount)}
                                textSize="28"
                            />
                        </div>

                        {/* Reviews Section */}
                        <div className="flex items-center gap-4">
                            <Rating
                                value={product.average_rating}
                                readOnly
                                precision={0.5}
                                sx={{
                                    "& .MuiRating-iconFilled": {
                                        color: "#FFD700",
                                    },
                                }}
                            />
                            <span className="text-gray1">
                                ({product.comments.length} Reviews)
                            </span>
                        </div>

                        {/* Share Section */}
                        <div className="flex items-center gap-3">
                            <span className="text-black text-lg font-bold">
                                Share this:
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaInstagram className="size-7 text-gray1" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaTwitter className="size-7 text-gray1" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaFacebook className="size-7 text-gray1" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaPinterest className="size-7 text-gray1" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Section */}
                        <div className="flex gap-4 flex-wrap items-end">
                            <ProductQuantityControl productId={product.id} />
                            <FavoriteButton productId={product.id} />
                        </div>

                        {/* Short Description */}
                        <div className="border border-[#E8E8E8] rounded-lg p-3 flex flex-col gap-4">
                            <div className="font-bold text-lg">
                                Short description
                            </div>
                            <div className="grid grid-cols-2 gap-4 leading-5">
                                <div>
                                    <span className="font-bold mb-1">
                                        SKU:{" "}
                                    </span>
                                    <span className="text-gray1">
                                        {product.sku_code}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold mb-1">
                                        Category:{" "}
                                    </span>
                                    <span className="text-gray1">
                                        Educational Toy
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold mb-1">
                                        Tags:{" "}
                                    </span>
                                    <span className="text-gray1">
                                        {product.tags
                                            .map((tag) => tag.name)
                                            .join(", ")}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#375259] font-medium mb-1">
                                        Stock:{" "}
                                    </span>
                                    <span
                                        className={
                                            product.stock_quantity > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        {product.stock_quantity > 0
                                            ? `${product.stock_quantity} items`
                                            : "Out of stock"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Secure Checkout */}
                        <div className="border border-[#E8E8E8] rounded-lg p-6">
                            <div className="font-bold text-lg mb-4">
                                Guaranteed Safe Checkout
                            </div>
                            <div className="flex gap-3 md:gap-6 flex-wrap">
                                <Image
                                    src="/payment/visa.svg"
                                    alt="Visa"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/mastercard.svg"
                                    alt="Mastercard"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/amex.svg"
                                    alt="American Express"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/discover.svg"
                                    alt="Discover"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/union.svg"
                                    alt="Union Pay"
                                    width={50}
                                    height={30}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description and Reviews Tabs */}
                <ProductTabs
                    description={product.description}
                    reviews={await getProductComments(product.id)}
                    product_id={product.id}
                />
            </div>
        </div>
    );
}
