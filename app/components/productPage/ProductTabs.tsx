"use client";
import { UserInfo } from "@/app/types/users";
import { fetchUsersInfo } from "@/app/utils/fetchUsers";
import { Rating, Tab, Tabs, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { comments } from "@prisma/client";
import Image from "next/image";
import { SyntheticEvent, useEffect, useState } from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ProductTabsProps {
    description: string | null;
    reviews: comments[];
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

const reviewsSample: comments[] = [
    {
        id: 1,
        product_id: 1,
        user_identifier: "google-oauth2|112469676930996239500",
        rating: 5,
        created_at: new Date("March 15, 2024"),
        comment: "**кинул зигу**",
    },
    {
        id: 2,
        product_id: 1,
        user_identifier: "auth0|66efcd3e412f3adf7f2c6acb",
        rating: 4,
        created_at: new Date("March 15, 2024"),
        comment: "я бля щас вскрою себе вены и забрызгаю кровью стены",
    },
    {
        id: 3,
        product_id: 1,
        user_identifier: "google-oauth2|103272541962828866987",
        rating: 5,
        created_at: new Date("March 15, 2024"),
        comment: "йоу пацаны я репер",
    },
];

const ProductTabs = ({
    description,
    reviews = reviewsSample,
}: ProductTabsProps) => {
    const [value, setValue] = useState(0);
    const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({});

    useEffect(() => {
        const loadUserInfo = async () => {
            const userIds = [
                ...Array.from(
                    new Set(reviews.map((review) => review.user_identifier))
                ),
            ];
            console.log(userIds);
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

        if (reviews.length > 0) {
            loadUserInfo();
        }
    }, [reviews]);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const averageRating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;

    return (
        <div className="mt-16">
            <StyledTabs
                value={value}
                onChange={handleChange}
                aria-label="product information tabs"
            >
                <StyledTab label="Description" />
                <StyledTab label={`Reviews (${reviews.length})`} />
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
                                Based on {reviews.length} reviews
                            </div>
                        </div>
                    </div>

                    {reviews.map((review) => {
                        const userInfo = usersInfo[review.user_identifier];
                        return (
                            <div
                                key={review.id}
                                className="border-b border-[#E8E8E8] pb-6"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <Avatar
                                        src={
                                            userInfo?.picture ||
                                            "/api/placeholder/40/40"
                                        }
                                        alt={userInfo?.name || "User"}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-semibold">
                                            {userInfo?.name || "Anonymous"}
                                        </div>
                                        <div className="text-gray1 text-sm">
                                            {new Date(
                                                review.created_at
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
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
                        );
                    })}
                </div>
            </TabPanel>
        </div>
    );
};

export default ProductTabs;
