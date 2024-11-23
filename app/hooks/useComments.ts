// hooks/useComments.ts

import { useState, useEffect } from "react";
import { pusherClient } from "@/app/lib/pusher";
import { comments } from "@prisma/client";
import { useAppSelector } from "../redux/hooks";

interface AddCommentData {
    comment: string;
    rating: number;
}

interface UpdateCommentData {
    id: number;
    comment: string;
    rating?: number;
}

export const useComments = (productId: number, initialComments: comments[]) => {
    const [comments, setComments] = useState<comments[]>(initialComments);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const user = useAppSelector((state) => state.user.user);

    useEffect(() => {
        // Подписываемся на канал продукта
        const channel = pusherClient.subscribe(`product-${productId}`);

        // Обработка новых комментариев
        channel.bind("comment:new", (newComment: comments) => {
            setComments((prevComments) => [
                newComment,
                ...prevComments.filter(
                    (comment) => comment.id !== newComment.id
                ),
            ]);
        });

        // Обработка обновления комментариев
        channel.bind("comment:update", (updatedComment: comments) => {
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === updatedComment.id ? updatedComment : comment
                )
            );
        });

        // Обработка удаления комментариев
        channel.bind("comment:delete", (data: { id: number }) => {
            setComments((prevComments) =>
                prevComments.filter((comment) => comment.id !== data.id)
            );
        });

        // Отписываемся при размонтировании
        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`product-${productId}`);
        };
    }, [productId]);

    // Добавление комментария
    const addComment = async (data: AddCommentData) => {
        if (!user) {
            setError("Must be logged in to comment");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: productId,
                    ...data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add comment");
            }

            // Добавляем локальное обновление состояния
            const newComment = await response.json();
            setComments((prevComments) => [
                newComment,
                ...prevComments.filter(
                    (comment) => comment.id !== newComment.id
                ),
            ]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to add comment"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление комментария
    const updateComment = async (data: UpdateCommentData) => {
        if (!user) {
            setError("Must be logged in to update comment");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/comments", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update comment");
            }

            // Добавляем локальное обновление состояния
            const updatedComment = await response.json();
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === data.id ? updatedComment : comment
                )
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update comment"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Удаление комментария
    const deleteComment = async (commentId: number) => {
        if (!user) {
            setError("Must be logged in to delete comment");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/comments?id=${commentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete comment");
            }

            // Добавляем локальное обновление состояния
            setComments((prevComments) =>
                prevComments.filter((comment) => comment.id !== commentId)
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete comment"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        comments,
        isLoading,
        error,
        addComment,
        updateComment,
        deleteComment,
    };
};
