import { useState } from "react";
import {
    FormControl,
    Select,
    MenuItem,
    InputBase,
    IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { ClientSortConfig } from "@/app/service/filters";
import { SortState } from "@/app/redux/productsSlice";

const StyledInput = styled(InputBase)(() => ({
    "label + &": {
        marginTop: 3,
    },
    "& .MuiInputBase-input": {
        fontSize: 14,
        padding: "8px 12px",
        transition: "border-color 0.2s ease",
        "&:focus": {
            borderColor: "#0F83B2",
        },
    },
}));

const StyledSelect = styled(Select)(() => ({
    display: "flex",
    alignItems: "center",
    borderRadius: "0.5rem",
    border: "1px solid #D4D4D4",
    transition: "all 0.2s ease",
    "&:hover": {
        borderColor: "#0F83B2",
    },
    "& .MuiSelect-select": {
        paddingRight: "32px !important",
        whiteSpace: "normal !important",
    },
}));

interface SortControlProps {
    currentSort: SortState;
    config: ClientSortConfig;
    onChange: (field: string, direction: "asc" | "desc") => void;
}

export default function SortControl({
    currentSort,
    config,
    onChange,
}: SortControlProps) {
    const handleSortChange = (field: string) => {
        const newSort = { field, direction: currentSort.direction };
        onChange(newSort.field, newSort.direction);
    };

    const handleDirectionChange = () => {
        if (!config.allowDirectionChange) return;
        const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
        const newSort = {
            ...currentSort,
            direction: newDirection,
        } satisfies SortState;
        onChange(newSort.field, newSort.direction);
    };

    return (
        <div className="flex items-center gap-2 w-full xs:w-auto">
            <FormControl
                size="small"
                className="min-w-[160px] sm:min-w-[200px] flex-wrap max-w-full w-full xs:w-auto"
            >
                <StyledSelect
                    value={currentSort.field}
                    onChange={(e) => handleSortChange(String(e.target.value))}
                    input={<StyledInput className="text-wrap" />}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                borderRadius: "0.5rem",
                                marginTop: "8px",
                                maxWidth: "calc(100vw - 50px)",
                                boxShadow:
                                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px 1px rgb(0 0 0 / 0.1)",
                            },
                        },
                        MenuListProps: {
                            sx: {
                                padding: "0.25rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.25rem",
                            },
                        },
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "right",
                        },
                        transformOrigin: {
                            vertical: "top",
                            horizontal: "right",
                        },
                    }}
                >
                    {config.options.map((option) => (
                        <MenuItem
                            key={option.field}
                            value={option.field}
                            sx={{
                                fontSize: "14px",
                                borderRadius: "0.25rem",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                padding: "8px 12px",
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </StyledSelect>
            </FormControl>

            {config.allowDirectionChange &&
                currentSort.field !== config.defaultOption && (
                    <IconButton
                        size="small"
                        onClick={handleDirectionChange}
                        className="text-gray1 hover:text-blue1"
                    >
                        {currentSort.direction === "asc" ? (
                            <ArrowUpAZ className="w-5 h-5" />
                        ) : (
                            <ArrowDownAZ className="w-5 h-5" />
                        )}
                    </IconButton>
                )}
        </div>
    );
}
