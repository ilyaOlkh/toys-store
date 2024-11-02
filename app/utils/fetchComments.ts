import { comments } from "@prisma/client";

interface CommentCreateData {
    product_id: number;
    comment: string;
    rating: number;
}

interface CommentUpdateData {
    id: number;
    comment: string;
    rating?: number;
}

// Получение всех комментариев для продукта
export async function getProductComments(
    productId: number
): Promise<comments[]> {
    try {
        const response = await fetch(
            `${process.env.URL}/api/comments?productId=${productId}`,
            { method: "GET" }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch comments");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
}

// Создание нового комментария
export async function createComment(
    data: CommentCreateData
): Promise<comments> {
    try {
        const response = await fetch(`${process.env.URL}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create comment");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
}

// Обновление комментария
export async function updateComment(
    data: CommentUpdateData
): Promise<comments> {
    try {
        const response = await fetch(`${process.env.URL}/api/comments`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update comment");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
    }
}

// Удаление комментария
export async function deleteComment(
    commentId: number
): Promise<{ message: string }> {
    try {
        const response = await fetch(
            `${process.env.URL}/api/comments?id=${commentId}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete comment");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
}
