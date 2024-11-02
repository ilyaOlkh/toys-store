"use client";
import { UserInfo } from "@/app/types/users";
import { Rating, Avatar, Tooltip, IconButton } from "@mui/material";
import { comments } from "@prisma/client";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Image from "next/image";

const ReviewCard = ({
    review,
    userInfo,
    onDelete,
    isDeleting,
    canDelete,
}: {
    review: comments;
    userInfo?: UserInfo;
    onDelete: () => void;
    isDeleting: boolean;
    canDelete: boolean | null;
}) => {
    return (
        <div className="relative border-b border-[#E8E8E8] pb-6">
            {isDeleting && (
                <div className="absolute inset-0  rounded-lg flex items-center justify-center z-10">
                    <Image
                        src="/loading.svg"
                        alt="loading"
                        height={80}
                        width={80}
                    />
                </div>
            )}
            <div className={`${isDeleting ? "opacity-40" : ""}`}>
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
                    {!isDeleting && canDelete && (
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
            </div>
        </div>
    );
};

export default ReviewCard;
