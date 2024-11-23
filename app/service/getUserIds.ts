import { comments } from "@prisma/client";

export const getUserIds = (reviews: comments[]) => {
    const userIds = new Set<string>();

    reviews.forEach((review) => {
        userIds.add(review.user_identifier);
        if (review.edited_by) {
            userIds.add(review.edited_by);
        }
    });

    return Array.from(userIds);
};
