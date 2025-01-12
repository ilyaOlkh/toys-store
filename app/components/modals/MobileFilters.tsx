import { SwipeableDrawer, IconButton, useMediaQuery } from "@mui/material";
import { X } from "lucide-react";
import { ClientFilter, FilterValue } from "@/app/types/filters";
import { FiltersList } from "../productsList/FiltersList";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import { closeModal } from "@/app/redux/modalSlice";

interface MobileFiltersProps {
    filterValues: Record<string, FilterValue>;
    filterConfigs: ClientFilter[];
    onFilterChange: (name: string, value: FilterValue) => void;
}

export default function MobileFilters({
    filterValues,
    filterConfigs,
    onFilterChange,
}: MobileFiltersProps) {
    const appDispatch = useAppDispatch();
    const isOpen = useAppSelector(
        (state: RootState) => state.modal.openModal === "filters"
    );
    const isSmallScreen = useMediaQuery("(max-width: 640px)");

    return (
        <SwipeableDrawer
            open={isOpen}
            onClose={() => appDispatch(closeModal())}
            anchor={isSmallScreen ? "bottom" : "left"}
            onOpen={() => {}}
            disableSwipeToOpen={true}
        >
            <div className="bg-white size-full rounded-t-[1rem] relative flex flex-col">
                <div className="flex justify-between items-center px-4 py-5 border-b">
                    <h2 className="text-xl font-bold">Фільтри</h2>
                    <IconButton onClick={() => appDispatch(closeModal())}>
                        <X className="w-5 h-5" />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-hidden overflow-y-auto">
                    <FiltersList
                        variant="modal"
                        filterConfigs={filterConfigs}
                        filterValues={filterValues}
                        onFilterChange={onFilterChange}
                    />
                </div>
            </div>
        </SwipeableDrawer>
    );
}
