import Image from "next/image";
import { fetchProducts, fetchTypes } from "./utils/fetch";
import TypeCard from "./components/typeCard";
import HeroSection from "./components/heroSection";
import { ProductCard } from "./components/productCard";

export default async function Home() {
    const types = await fetchTypes();
    const products = await fetchProducts();
    console.log(products);
    if (types.length === 0) return <div>Loading...</div>;
    return (
        <div>
            <HeroSection />
            <div className="flex justify-center">
                <div className="customContainer">
                    <h1>Product Types</h1>
                    <ul className="flex gap-2 flex-wrap justify-around">
                        {types ? (
                            types.map((type) => (
                                <li key={type.id}>
                                    <TypeCard typeObj={type} />
                                </li>
                            ))
                        ) : (
                            <></>
                        )}
                        <div className="grid grid-cols-1 gap-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    id={product.id}
                                    img={product.imageUrl ?? "/noPhoto.png"}
                                    title={product.name}
                                    firstPrice={String(product.price)}
                                    discountPrice={String(product.discount)}
                                    rating={4.5}
                                />
                            ))}
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
}
