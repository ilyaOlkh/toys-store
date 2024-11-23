"use client";
// components/ProductTabs.tsx

import { useAppSelector } from "@/app/redux/hooks";
import { UserInfo } from "@/app/types/users";
import { fetchUsersInfo } from "@/app/utils/fetchUsers";
import { Rating, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { comments } from "@prisma/client";
import { SyntheticEvent, useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import { selectIsAdmin } from "@/app/redux/userSlice";
import ReviewCard from "./ReviewCard";
import { useComments } from "@/app/hooks/useComments";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ProductTabsProps {
    description: string | null;
    reviews: comments[];
    product_id: number;
}

const StyledTabs = styled(Tabs)({
    borderBottom: "1px solid #E8E8E8",
    "& .MuiTabs-indicator": {
        backgroundColor: "#0F83B2",
        height: "2px",
    },
});

const StyledTab = styled(Tab)({
    textTransform: "none",
    fontWeight: 500,
    fontSize: "16px",
    color: "#7F7F7F",
    "&.Mui-selected": {
        color: "#0F83B2",
    },
});

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`product-tabpanel-${index}`}
            aria-labelledby={`product-tab-${index}`}
            {...other}
        >
            {value === index && <div className="py-8">{children}</div>}
        </div>
    );
}

const ProductTabs = ({
    description,
    reviews,
    product_id,
}: ProductTabsProps) => {
    const [value, setValue] = useState(0);
    const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({});
    const [deletingComments, setDeletingComments] = useState<number[]>([]);
    const { comments, isLoading, error, addComment, deleteComment } =
        useComments(product_id, reviews);
    const user = useAppSelector((state) => state.user.user);
    const isAdmin = useAppSelector(selectIsAdmin);

    useEffect(() => {
        const loadUserInfo = async () => {
            const userIds = Array.from(
                new Set(comments.map((review) => review.user_identifier))
            );
            const users = await fetchUsersInfo(userIds);
            const usersMap = users.reduce(
                (acc: Record<string, UserInfo>, user: UserInfo) => {
                    acc[user.user_id] = user;
                    return acc;
                },
                {}
            );
            setUsersInfo(usersMap);
        };

        if (comments.length > 0) {
            loadUserInfo();
        }
    }, [comments]);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

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
        <div className="mt-16">
            <StyledTabs
                value={value}
                onChange={handleChange}
                aria-label="product information tabs"
            >
                <StyledTab label="Description" />
                <StyledTab label={`Reviews (${comments.length})`} />
            </StyledTabs>

            <TabPanel value={value} index={0}>
                <div className="prose max-w-none text-gray1">{description}</div>
            </TabPanel>

            <TabPanel value={value} index={1}>
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
                                (user.sub === review.user_identifier ||
                                    isAdmin);

                            return (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    userInfo={userInfo}
                                    onDelete={() =>
                                        handleDeleteComment(review.id)
                                    }
                                    canDelete={canDelete}
                                    isDeleting={deletingComments.includes(
                                        review.id
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </TabPanel>
        </div>
    );
};

export default ProductTabs;
