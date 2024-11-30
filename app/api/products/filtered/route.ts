import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { FilterValue } from "@/app/types/filters";
import { serverFilters } from "@/app/constants/filtersSettings";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filtersParam = searchParams.get("filters");

        // Получаем фильтры из параметров
        const filters: Record<string, FilterValue> = filtersParam
            ? JSON.parse(filtersParam)
            : {};

        // Формируем WHERE условие для Prisma
        const whereConditions = Object.entries(filters).reduce(
            (acc, [name, value]) => {
                // Находим конфигурацию фильтра
                const filterConfig = serverFilters.find((f) => f.name === name);

                if (!filterConfig || value === filterConfig.defaultValue) {
                    return acc;
                }

                if (filterConfig.prismaQuery) {
                    return {
                        ...acc,
                        ...filterConfig.prismaQuery(value as never),
                    };
                }

                return acc;
            },
            {}
        );

        // Получаем продукты с примененными фильтрами
        const products = await prisma.products.findMany({
            where: whereConditions,
            include: {
                images: true,
                comments: true,
            },
        });

        // Преобразуем продукты в нужный формат
        const formattedProducts = products.map((product) => ({
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
            discount: Number(product.discount),
        }));

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
