"use client";
// ReviewCard.tsx
import { UserInfo } from "@/app/types/users";
import {
    Rating,
    Avatar,
    Tooltip,
    IconButton,
    TextField,
    Button,
} from "@mui/material";
import { comments } from "@prisma/client";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Image from "next/image";
import { useState } from "react";

interface ReviewCardProps {
    review: comments;
    userInfo?: UserInfo;
    onDelete: () => void;
    onUpdate: (data: { comment: string; rating: number }) => void;
    isDeleting: boolean;
    isUpdating: boolean;
    canDelete: boolean | null;
    canUpdate: boolean | null;
}

const ReviewCard = ({
    review,
    userInfo,
    onDelete,
    onUpdate,
    isDeleting,
    isUpdating,
    canDelete,
    canUpdate,
}: ReviewCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(review.comment);
    const [editedRating, setEditedRating] = useState(review.rating);

    const handleSubmit = () => {
        onUpdate({
            comment: editedComment,
            rating: editedRating,
        });
        setIsEditing(false);
    };

    return (
        <div className="relative border-b border-[#E8E8E8] pb-6">
            {(isDeleting || isUpdating) && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center z-10">
                    <Image
                        src="/loading.svg"
                        alt="loading"
                        height={80}
                        width={80}
                    />
                </div>
            )}
            <div className={`${isDeleting || isUpdating ? "opacity-40" : ""}`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 mb-3">
                        <Avatar
                            src={userInfo?.picture || "/api/placeholder/40/40"}
                            alt={userInfo?.name || "User"}
                            sx={{ width: 40, height: 40 }}
                        />
                        <div className="flex flex-col">
                            <div className="font-semibold">
                                {userInfo?.name || "Anonymous"}
                            </div>
                            <div className="text-gray1 text-sm">
                                {new Date(review.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                    {!isDeleting && !isUpdating && (
                        <div className="flex gap-2">
                            {canUpdate && (
                                <Tooltip title="Edit comment">
                                    <IconButton
                                        onClick={() => setIsEditing(true)}
                                        size="small"
                                        sx={{
                                            color: "#3b82f6",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(59, 130, 246, 0.04)",
                                            },
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {canDelete && (
                                <Tooltip title="Delete comment">
                                    <IconButton
                                        onClick={onDelete}
                                        size="small"
                                        sx={{
                                            color: "#ef4444",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(239, 68, 68, 0.04)",
                                            },
                                        }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="flex flex-col gap-4">
                        <Rating
                            value={editedRating}
                            onChange={(_, newValue) =>
                                setEditedRating(newValue || review.rating)
                            }
                            size="small"
                            sx={{
                                "& .MuiRating-iconFilled": {
                                    color: "#FFD700",
                                },
                            }}
                        />
                        <TextField
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={() => setIsEditing(false)}
                                variant="outlined"
                                color="inherit"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                color="primary"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            className="mb-2"
                            sx={{
                                "& .MuiRating-iconFilled": {
                                    color: "#FFD700",
                                },
                            }}
                        />
                        <p className="text-gray1">{review.comment}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
