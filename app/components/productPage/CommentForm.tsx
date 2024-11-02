"use client";
import { createComment } from "@/app/utils/fetchComments";
import { Rating, Button, TextField } from "@mui/material";
import { comments } from "@prisma/client";
import { useState } from "react";

const CommentForm = ({
    productId,
    onCommentAdded,
}: {
    productId: number;
    onCommentAdded: (newComment: comments) => void;
}) => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) {
            setError("Please select a rating");
            return;
        }
        if (!comment.trim()) {
            setError("Please enter a comment");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const newComment = await createComment({
                product_id: productId,
                comment: comment.trim(),
                rating: rating,
            });

            onCommentAdded(newComment);
            setComment("");
            setRating(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to post comment"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-8 border-b border-[#E8E8E8] pb-8"
        >
            <div className="mb-4">
                <div className="mb-2">Your rating</div>
                <Rating
                    value={rating}
                    onChange={(_, newValue) => {
                        setRating(newValue);
                        setError(null);
                    }}
                    sx={{
                        "& .MuiRating-iconFilled": {
                            color: "#FFD700",
                        },
                    }}
                />
            </div>

            <TextField
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => {
                    setComment(e.target.value);
                    setError(null);
                }}
                placeholder="Write your review here..."
                variant="outlined"
                className="mb-4"
                error={!!error}
                helperText={error}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                    bgcolor: "#0F83B2",
                    "&:hover": {
                        bgcolor: "#0C698E",
                    },
                }}
            >
                {isSubmitting ? "Posting..." : "Post Review"}
            </Button>
        </form>
    );
};

export default CommentForm;
