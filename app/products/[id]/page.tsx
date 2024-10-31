import { fetchProduct } from "@/app/utils/fetch";
import { IParams } from "../../types/types";
import Image from "next/image";
import { Rating } from "@mui/material";
import Price from "@/app/components/price";
import ProductGallery from "@/app/components/productGallery";
import {
    FaInstagram,
    FaTwitter,
    FaFacebook,
    FaPinterest,
} from "react-icons/fa";
import { ProductQuantityControl } from "@/app/components/ProductQuantityControl";

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
                <div className="flex flex-col gap-12 lg:flex-row">
                    {/* Gallery Section */}
                    <div className="w-full lg:w-1/2">
                        <ProductGallery images={product.images} />
                    </div>

                    {/* Product Details Section */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        <h1 className="text-[32px] font-bold text-[#375259]">
                            {product.name}
                        </h1>

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
                            <span className="text-[#7F7F7F]">
                                ({product.comments.length} Reviews)
                            </span>
                        </div>

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
                            />
                        </div>

                        {/* Share Section */}
                        <div className="flex items-center gap-4 mt-4">
                            <span className="text-[#375259] font-medium">
                                Share this:
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaInstagram className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaTwitter className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaFacebook className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FaPinterest className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Section */}
                        <ProductQuantityControl
                            productId={product.id}
                            price={Number(product.price)}
                        />

                        {/* Short Description */}
                        <div className="border border-[#E8E8E8] rounded-lg p-6 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[#375259] font-medium mb-1">
                                        SKU:
                                    </div>
                                    <div className="text-[#7F7F7F]">
                                        {product.sku_code}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[#375259] font-medium mb-1">
                                        Category:
                                    </div>
                                    <div className="text-[#7F7F7F]">
                                        Educational Toy
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[#375259] font-medium mb-1">
                                        Tags:
                                    </div>
                                    <div className="text-[#7F7F7F]">
                                        2 - 5 years
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[#375259] font-medium mb-1">
                                        Stock:
                                    </div>
                                    <div
                                        className={
                                            product.stock_quantity > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        {product.stock_quantity > 0
                                            ? `${product.stock_quantity} items`
                                            : "Out of stock"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secure Checkout */}
                        <div className="border border-[#E8E8E8] rounded-lg p-6">
                            <div className="text-[#375259] font-medium mb-4">
                                Guaranteed Safe Checkout
                            </div>
                            <div className="flex gap-2">
                                <Image
                                    src="/payment/visa.png"
                                    alt="Visa"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/mastercard.png"
                                    alt="Mastercard"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/amex.png"
                                    alt="American Express"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/discover.png"
                                    alt="Discover"
                                    width={50}
                                    height={30}
                                />
                                <Image
                                    src="/payment/unionpay.png"
                                    alt="Union Pay"
                                    width={50}
                                    height={30}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description and Reviews Tabs */}
                <div className="mt-16">
                    <div className="border-b border-[#E8E8E8]">
                        <div className="flex gap-8">
                            <button className="px-4 py-2 border-b-2 border-[#0F83B2] text-[#0F83B2] font-medium">
                                Description
                            </button>
                            <button className="px-4 py-2 text-[#7F7F7F] hover:text-[#375259]">
                                Reviews ({product.comments.length})
                            </button>
                        </div>
                    </div>
                    <div className="py-8">
                        <div className="prose max-w-none text-[#7F7F7F]">
                            {product.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
