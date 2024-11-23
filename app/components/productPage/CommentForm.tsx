// components/CommentForm.tsx
"use client";

import { Rating, Button, TextField } from "@mui/material";
import { useState } from "react";

interface CommentFormProps {
    onSubmit: (data: { comment: string; rating: number }) => Promise<void>;
}

const CommentForm = ({ onSubmit }: CommentFormProps) => {
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
            await onSubmit({
                comment: comment.trim(),
                rating: rating,
            });

            // Очищаем форму после успешной отправки
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
            className="mb-8 border-b border-[#E8E8E8] pb-8 flex flex-col gap-4 items-start"
        >
            <div className=" flex flex-col gap-2 items-start">
                <div>Your rating</div>
                <Rating
                    value={rating}
                    onChange={(_, newValue) => {
                        setRating(newValue);
                        setError(null);
                    }}
                    disabled={isSubmitting}
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
                disabled={isSubmitting}
                placeholder="Write your review here..."
                variant="outlined"
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
                {isSubmitting ? (
                    <span className="flex items-center">
                        Posting...
                        <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </span>
                ) : (
                    "Post Review"
                )}
            </Button>
        </form>
    );
};

export default CommentForm;
