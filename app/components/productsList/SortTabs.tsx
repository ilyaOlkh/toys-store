"use client";

import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useProducts } from "../ProductsContext";
import { sortProducts } from "@/app/redux/productsSlice";
import { styled } from "@mui/material/styles";

const StyledTabs = styled(Tabs)({
    "& .MuiTabs-indicator": {
        display: "none",
    },
    minHeight: "40px",
});

const StyledTab = styled(Tab)({
    textTransform: "none",
    minHeight: "40px",
    padding: "8px 16px",
    backgroundColor: "#F8F8F8",
    borderRadius: "50px",
    marginRight: "8px",
    "&.Mui-selected": {
        backgroundColor: "#FDF2F8",
        color: "#000",
    },
    "&:hover": {
        backgroundColor: "#FDF2F8",
    },
});

export function SortTabs() {
    const { sort, sortConfig, dispatch } = useProducts();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        dispatch(
            sortProducts({
                field: newValue,
            })
        );
    };

    console.log(sort.field);

    if (!sortConfig?.options) return null;

    return (
        <div className="mb-6">
            <StyledTabs
                value={sort.field}
                onChange={handleChange}
                aria-label="product sorting tabs"
            >
                {sortConfig.options.map((option) => (
                    <StyledTab
                        key={option.field}
                        label={option.label}
                        value={option.field}
                    />
                ))}
            </StyledTabs>
        </div>
    );
}
