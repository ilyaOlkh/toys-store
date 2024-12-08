import { fetchTypes } from "./utils/fetch";
import TypeCard from "./components/typeCard";
import HeroSection from "./components/heroSection";
import { fetchFilteredProducts } from "./utils/fetchFilteredProducts";
import { getClientSorts } from "./service/filters";
import { SortDirection } from "./types/filters";
import MainProductScreen from "./components/productsList/MainProductScreen";

export default async function Home() {
    const [types, initialSorts] = await Promise.all([
        fetchTypes(),
        getClientSorts(),
    ]);

    const defaultSort = {
        field: initialSorts[0]?.defaultOption || "default",
        direction: (initialSorts[0]?.defaultDirection ||
            "asc") as SortDirection,
    };

    const products = await fetchFilteredProducts(
        {},
        defaultSort,
        "secondarySort",
        { limit: 8, offset: 0 }
    );

    if (types.length === 0) return <div>Loading...</div>;
    return (
        <div>
            <HeroSection />
            <div className="flex justify-center">
                <div className="customContainer">
                    <section className="flex flex-col gap-12 items-center pt-12 md:pt-24 pb-6 md:pb-12">
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-4xl text-black font-bold text-center">
                                Знайди ідеальну іграшку
                            </p>
                            <p className="text-2xl text-[#2D2D2D] text-center">
                                Наші колекції
                            </p>
                        </div>
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
                        </ul>
                    </section>
                    <section className="py-12">
                        <h2 className="text-3xl font-bold text-center mb-8">
                            Популярні іграшки
                        </h2>
                        <MainProductScreen
                            initialProducts={products}
                            initialSortConfig={initialSorts[1]}
                            initialSortingRuleSet="secondarySort"
                            initialSort={defaultSort}
                            limit={8}
                            offset={0}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
