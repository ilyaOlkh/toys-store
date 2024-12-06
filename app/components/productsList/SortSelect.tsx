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

const StyledInput = styled(InputBase)(() => ({
    "label + &": {
        marginTop: 3,
    },
    "& .MuiInputBase-input": {
        position: "relative",
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
    },
}));

interface SortControlProps {
    config: ClientSortConfig;
    onChange: (field: string, direction: "asc" | "desc") => void;
}

export default function SortControl({ config, onChange }: SortControlProps) {
    const [sort, setSort] = useState({
        field: config.defaultOption,
        direction: config.defaultDirection,
    });

    const handleSortChange = (field: string) => {
        const newSort = { field, direction: sort.direction };
        setSort(newSort);
        onChange(newSort.field, newSort.direction);
    };

    const handleDirectionChange = () => {
        if (!config.allowDirectionChange) return;
        const newDirection = sort.direction === "asc" ? "desc" : "asc";
        const newSort = {
            ...sort,
            direction: newDirection,
        } satisfies typeof sort;
        setSort(newSort);
        onChange(newSort.field, newSort.direction);
    };

    return (
        <div className="flex items-center gap-2">
            <FormControl size="small" className="min-w-48">
                <StyledSelect
                    value={sort.field}
                    onChange={(e) => handleSortChange(String(e.target.value))}
                    input={<StyledInput />}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                borderRadius: "0.5rem",
                                marginTop: "4px",
                                boxShadow:
                                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                            },
                        },
                    }}
                >
                    {config.options.map((option) => (
                        <MenuItem
                            key={option.field}
                            value={option.field}
                            sx={{
                                fontSize: "14px",
                                marginX: "4px",
                                borderRadius: "0.25rem",
                                "&:first-of-type": { marginTop: "4px" },
                                "&:last-of-type": { marginBottom: "4px" },
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </StyledSelect>
            </FormControl>

            {config.allowDirectionChange &&
                sort.field !== config.defaultOption && (
                    <IconButton
                        size="small"
                        onClick={handleDirectionChange}
                        className="text-gray1 hover:text-blue1"
                    >
                        {sort.direction === "asc" ? (
                            <ArrowUpAZ className="w-5 h-5" />
                        ) : (
                            <ArrowDownAZ className="w-5 h-5" />
                        )}
                    </IconButton>
                )}
        </div>
    );
}
