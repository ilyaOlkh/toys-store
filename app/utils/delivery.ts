// utils/delivery.ts

export const FREE_DELIVERY_THRESHOLD = 1500; // Threshold in UAH

export interface DeliveryCostProps {
    total: number;
    deliveryMethod: "nova_poshta" | "ukr_poshta" | "pickup";
}

export interface DeliveryCostResult {
    type: "free" | "carrier_tariff";
    cost: number | null;
}

export const calculateDeliveryCost = ({
    total,
    deliveryMethod,
}: DeliveryCostProps): DeliveryCostResult => {
    if (deliveryMethod === "pickup") {
        return {
            type: "free",
            cost: 0,
        };
    }

    if (total >= FREE_DELIVERY_THRESHOLD) {
        return {
            type: "free",
            cost: 0,
        };
    }

    return {
        type: "carrier_tariff",
        cost: null, // Actual cost will be determined by the carrier
    };
};

// Helper function to format delivery cost for display
export const formatDeliveryCost = (result: DeliveryCostResult): string => {
    if (result.type === "free") {
        return "Безкоштовна доставка";
    }
    return "За тарифами перевізника";
};
