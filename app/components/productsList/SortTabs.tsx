"use client";

import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useProducts } from "../ProductsContext";
import { sortProducts } from "@/app/redux/productsSlice";
import { styled } from "@mui/material/styles";
import { useMediaQuery, useTheme } from "@mui/material";

interface StyledTabsProps {
    isVertical?: boolean;
}

const StyledTabs = styled(Tabs, {
    shouldForwardProp: (prop) => prop !== "isVertical",
})<StyledTabsProps>(({ theme, isVertical }) => ({
    "& .MuiTabs-indicator": {
        [isVertical ? "width" : "height"]: "100%",
        borderRadius: "50px",
        backgroundColor: "#FDF2F8",
        zIndex: 0,
    },
    "& .MuiTabs-flexContainer": {
        zIndex: 1,
        position: "relative",
        flexDirection: isVertical ? "column" : "row",
    },
    minHeight: isVertical ? "auto" : "40px",
}));

const StyledTab = styled(Tab, {
    shouldForwardProp: (prop) => prop !== "isVertical",
})<StyledTabsProps>(({ isVertical }) => ({
    textTransform: "none",
    minHeight: "40px",
    padding: "8px 16px",
    borderRadius: "50px",
    marginRight: isVertical ? 0 : "8px",
    marginBottom: isVertical ? "8px" : 0,
    color: "#000",
    "&.Mui-selected": {
        color: "#000",
    },
    zIndex: 2,
    width: isVertical ? "100%" : "auto",
}));

export function SortTabs() {
    const { sort, sortConfig, dispatch } = useProducts();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        dispatch(
            sortProducts({
                field: newValue,
            })
        );
    };

    if (!sortConfig?.options) return null;

    return (
        <div className="flex justify-center">
            <div className={`mb-6 ${isMobile ? "w-full max-w-[280px]" : ""}`}>
                <StyledTabs
                    value={sort.field}
                    onChange={handleChange}
                    orientation={isMobile ? "vertical" : "horizontal"}
                    isVertical={isMobile}
                    aria-label="product sorting tabs"
                >
                    {sortConfig.options.map((option) => (
                        <StyledTab
                            key={option.field}
                            label={option.label}
                            value={option.field}
                            isVertical={isMobile}
                            disableRipple
                            sx={{
                                fontSize: "1.25rem",
                                textAlign: "left",
                                justifyContent: isMobile
                                    ? "flex-start"
                                    : "center",
                            }}
                        />
                    ))}
                </StyledTabs>
            </div>
        </div>
    );
}
