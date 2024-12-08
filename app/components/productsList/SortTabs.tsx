"use client";

import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useProducts } from "../ProductsContext";
import { sortProducts } from "@/app/redux/productsSlice";
import { styled } from "@mui/material/styles";

const StyledTabs = styled(Tabs)(({ theme }) => ({
    "& .MuiTabs-indicator": {
        height: "100%",
        borderRadius: "50px",
        backgroundColor: "#FDF2F8",
        zIndex: 0,
    },
    "& .MuiTabs-flexContainer": {
        zIndex: 1,
        position: "relative",
    },
    minHeight: "40px",
}));

const StyledTab = styled(Tab)({
    textTransform: "none",
    minHeight: "40px",
    padding: "8px 16px",
    borderRadius: "50px",
    marginRight: "8px",
    color: "#000",
    "&.Mui-selected": {
        color: "#000",
    },
    zIndex: 2,
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

    if (!sortConfig?.options) return null;
    console.log(sort.field);
    return (
        <div className="flex justify-center">
            <div className="mb-6 ">
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
                            sx={{
                                fontSize: "1.25rem",
                            }}
                        />
                    ))}
                </StyledTabs>
            </div>
        </div>
    );
}
