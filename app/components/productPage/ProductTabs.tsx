"use client";
// components/ProductTabs.tsx

import { useAppSelector } from "@/app/redux/hooks";
import { UserInfo } from "@/app/types/users";
import { fetchUsersInfo } from "@/app/utils/fetchUsers";
import { Divider, Rating } from "@mui/material";
import { comments } from "@prisma/client";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import { selectIsAdmin } from "@/app/redux/userSlice";
import ReviewCard from "./ReviewCard";
import { useComments } from "@/app/hooks/useComments";

interface ProductTabsProps {
    description: string | null;
    reviews: comments[];
    product_id: number;
}

const ProductTabs = ({
    description,
    reviews,
    product_id,
}: ProductTabsProps) => {
    const [value, setValue] = useState(0);
    const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({});
    const [deletingComments, setDeletingComments] = useState<number[]>([]);
    const [updatingComments, setUpdatingComments] = useState<number[]>([]);

    const {
        comments,
        isLoading,
        error,
        addComment,
        deleteComment,
        updateComment,
    } = useComments(product_id, reviews);
    const user = useAppSelector((state) => state.user.user);
    const isAdmin = useAppSelector(selectIsAdmin);

    useEffect(() => {
        const loadUserInfo = async () => {
            // Получаем все уникальные ID пользователей из комментариев
            const allUserIds = Array.from(
                new Set(comments.map((review) => review.user_identifier))
            );

            // Фильтруем только тех пользователей, информации о которых у нас еще нет
            const newUserIds = allUserIds.filter((id) => !usersInfo[id]);

            // Если нет новых пользователей, не делаем запрос
            if (newUserIds.length === 0) {
                return;
            }

            // Загружаем информацию только о новых пользователях
            const users = await fetchUsersInfo(newUserIds);

            // Обновляем состояние, сохраняя существующую информацию
            setUsersInfo((prevUsersInfo) => ({
                ...prevUsersInfo,
                ...users.reduce(
                    (acc: Record<string, UserInfo>, user: UserInfo) => {
                        acc[user.user_id] = user;
                        return acc;
                    },
                    {}
                ),
            }));
        };

        if (comments.length > 0) {
            loadUserInfo();
        }
    }, [comments, usersInfo]);

    const handleCommentSubmit = async (data: {
        comment: string;
        rating: number;
    }) => {
        try {
            await addComment(data);
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleUpdateComment = async (
        commentId: number,
        data: { comment: string; rating: number }
    ) => {
        try {
            setUpdatingComments((prev) => [...prev, commentId]);
            await updateComment({ id: commentId, ...data });
        } catch (err) {
            console.error("Error updating comment:", err);
        } finally {
            setUpdatingComments((prev) =>
                prev.filter((id) => id !== commentId)
            );
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                setDeletingComments((prev) => [...prev, commentId]);
                await deleteComment(commentId);
            } catch (err) {
                console.error("Error deleting comment:", err);
            } finally {
                setDeletingComments((prev) =>
                    prev.filter((id) => id !== commentId)
                );
            }
        }
    };

    const averageRating =
        comments.reduce((acc, review) => acc + review.rating, 0) /
            comments.length || 0;

    return (
        <div className="mt-16 flex flex-col gap-12">
            <Divider />
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold">
                        {averageRating.toFixed(1)}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Rating
                            value={averageRating}
                            readOnly
                            precision={0.1}
                            sx={{
                                "& .MuiRating-iconFilled": {
                                    color: "#FFD700",
                                },
                            }}
                        />
                        <div className="text-gray1 text-sm">
                            Based on {comments.length} reviews
                        </div>
                    </div>
                </div>

                {user && <CommentForm onSubmit={handleCommentSubmit} />}

                {error && <div className="text-red-500 mt-4">{error}</div>}

                <div className="space-y-6">
                    {comments.map((review) => {
                        const userInfo = usersInfo[review.user_identifier];
                        const canDelete =
                            user &&
                            (user.sub === review.user_identifier || isAdmin);
                        const canUpdate =
                            user &&
                            (user.sub === review.user_identifier || isAdmin);

                        return (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                userInfo={userInfo}
                                onDelete={() => handleDeleteComment(review.id)}
                                onUpdate={(data) =>
                                    handleUpdateComment(review.id, data)
                                }
                                canDelete={canDelete}
                                canUpdate={canUpdate}
                                isDeleting={deletingComments.includes(
                                    review.id
                                )}
                                isUpdating={updatingComments.includes(
                                    review.id
                                )}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductTabs;
