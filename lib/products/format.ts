function calculateAverageRating(comments: any[]) {
    if (comments.length === 0) return 0;
    return (
        comments.reduce(
            (acc: number, comment: any) => acc + comment.rating,
            0
        ) / comments.length
    );
}

export function formatProducts(products: any[]) {
    const currentDate = new Date();

    return products.map((product) => {
        const activeDiscount = product.discounts.findLast(
            (discount: any) =>
                discount.start_date <= currentDate &&
                discount.end_date >= currentDate
        );

        return {
            ...product,
            imageUrl: product.images[0]?.image_blob ?? "/noPhoto.png",
            average_rating: calculateAverageRating(product.comments),
            price: Number(product.price),
            discount: activeDiscount
                ? Number(activeDiscount.new_price)
                : undefined,
        };
    });
}
