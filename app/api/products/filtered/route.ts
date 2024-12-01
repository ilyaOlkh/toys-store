import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { FilterValue } from "@/app/types/filters";
import { serverFilters } from "@/app/constants/filtersSettings";

const prisma = new PrismaClient();

type ProductWithRelations = Prisma.productsGetPayload<{
    include: {
        images: true;
        comments: true;
        discounts: true;
    };
}>;

type FormattedProduct = Omit<ProductWithRelations, "price" | "discount"> & {
    imageUrl: string;
    average_rating: number;
    price: number;
    discount?: number;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filtersParam = searchParams.get("filters");

        // Получаем фильтры из параметров
        const filters: Record<string, FilterValue> = filtersParam
            ? JSON.parse(filtersParam)
            : {};

        // Получаем все активные фильтры и их условия
        const activeFiltersPromises = Object.entries(filters).map(
            async ([name, value]) => {
                const config = serverFilters.find((f) => f.name === name);
                if (!config || value === config.defaultValue) return null;

                if (Array.isArray(value) && value.length === 0) return null;

                let condition = await config.prismaQuery(value);

                // Если условие включает raw query
                if (
                    condition &&
                    typeof condition === "object" &&
                    "id" in condition
                ) {
                    const idCondition = condition.id;
                    if (
                        idCondition &&
                        typeof idCondition === "object" &&
                        "in" in idCondition
                    ) {
                        const rawResults = await prisma.$queryRaw<
                            { id: number }[]
                        >`${idCondition.in}`;
                        return {
                            id: {
                                in: rawResults.map((r) => r.id),
                            },
                        } satisfies Prisma.productsWhereInput;
                    }
                }

                if (condition && typeof condition === "object") {
                    const isEmpty = Object.entries(condition).every(
                        ([_, value]) => {
                            if (Array.isArray(value)) return value.length === 0;
                            if (typeof value === "object" && value !== null) {
                                return Object.keys(value).length === 0;
                            }
                            return false;
                        }
                    );
                    if (isEmpty) return null;
                }

                return condition;
            }
        );

        // Ждем выполнения всех запросов и фильтруем null значения
        const activeFilters = (await Promise.all(activeFiltersPromises)).filter(
            (filter): filter is Prisma.productsWhereInput => filter !== null
        );

        // Формируем WHERE условие
        const whereConditions: Prisma.productsWhereInput =
            activeFilters.length > 0 ? { AND: activeFilters } : {};

        // Получаем продукты с примененными фильтрами
        const products = await prisma.products.findMany({
            where: whereConditions,
            include: {
                images: true,
                comments: true,
                discounts: true,
            },
        });

        // Форматируем продукты
        const formattedProducts: FormattedProduct[] = products.map(
            (product) => {
                const currentDate = new Date();
                const activeDiscount = product.discounts.findLast(
                    (discount) =>
                        discount.start_date <= currentDate &&
                        discount.end_date >= currentDate
                );

                return {
                    ...product,
                    imageUrl: product.images[0]?.image_blob ?? "/noPhoto.png",
                    average_rating:
                        product.comments.length > 0
                            ? product.comments.reduce(
                                  (acc, comment) => acc + comment.rating,
                                  0
                              ) / product.comments.length
                            : 0,
                    price: Number(product.price),
                    discount: activeDiscount
                        ? Number(activeDiscount.new_price)
                        : undefined,
                };
            }
        );

        return NextResponse.json({
            products: formattedProducts,
            total: formattedProducts.length,
            appliedFilters: whereConditions,
        });
    } catch (error) {
        console.error("Error processing filtered products request:", error);
        return NextResponse.json(
            { error: "Failed to fetch filtered products" },
            { status: 500 }
        );
    }
}
