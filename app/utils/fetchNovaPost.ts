interface NovaPoshtaParams {
    cityName?: string;
    cityRef?: string;
    isWarehouse?: boolean;
}

interface CitiesSearchParams {
    searchQuery?: string;
    limit?: number;
}

interface NovaPoshtaResponse<T> {
    success: boolean;
    data: T[];
    errors: string[];
    warnings: string[];
    info: {
        totalCount: number;
    };
}

interface WarehouseInfo {
    Ref: string;
    Description: string;
    DescriptionRu: string;
    CityRef: string;
    CityDescription: string;
    CityDescriptionRu: string;
    TypeOfWarehouse: string;
    Number: string;
    PostFinance: string;
    Reception: {
        Monday: string;
        Tuesday: string;
        Wednesday: string;
        Thursday: string;
        Friday: string;
        Saturday: string;
        Sunday: string;
    };
    Schedule: {
        Monday: string;
        Tuesday: string;
        Wednesday: string;
        Thursday: string;
        Friday: string;
        Saturday: string;
        Sunday: string;
    };
}

interface CityInfo {
    Ref: string;
    Description: string;
    DescriptionRu: string;
    Area: string;
    SettlementType: string;
    IsBranch: string;
    PreventEntryNewStreetsUser: null | string;
    Conglomerates: null | string;
    CityID: string;
    SettlementTypeDescriptionRu: string;
    SettlementTypeDescription: string;
}

export async function fetchNovaPoshtaWarehouses(
    params?: NovaPoshtaParams
): Promise<string[]> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;
        if (!apiKey) {
            throw new Error("Nova Poshta API key is not configured");
        }

        const requestBody = {
            apiKey: apiKey,
            modelName: "Address",
            calledMethod: "getWarehouses",
            methodProperties: {
                CityName: params?.cityName || "",
                CityRef: params?.cityRef || "",
            },
        };

        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            next: {
                revalidate: Number(process.env.NEXT_PUBLIC_REVALIDATE) || 3600,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Nova Poshta warehouses: ${response.statusText}`
            );
        }

        const data: NovaPoshtaResponse<WarehouseInfo> = await response.json();

        if (!data.success) {
            throw new Error(`Nova Poshta API error: ${data.errors.join(", ")}`);
        }

        return data.data
            .filter(
                (item) =>
                    item.TypeOfWarehouse ===
                    "841339c7-591a-42e2-8233-7a0a00f0ed6f"
            )
            .map((item) => item.Description);
    } catch (error) {
        console.error("Error fetching Nova Poshta warehouses:", error);
        throw error;
    }
}

// Функция для получения только почтоматов
export async function fetchNovaPoshtaPostomates(
    params?: NovaPoshtaParams
): Promise<string[]> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;
        if (!apiKey) {
            throw new Error("Nova Poshta API key is not configured");
        }

        const requestBody = {
            apiKey: apiKey,
            modelName: "Address",
            calledMethod: "getWarehouses",
            methodProperties: {
                CityName: params?.cityName || "",
                CityRef: params?.cityRef || "",
                TypeOfWarehouse: "f9316480-5f2d-425d-bc2c-ac7cd29decf0",
            },
        };

        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            next: {
                revalidate: Number(process.env.NEXT_PUBLIC_REVALIDATE) || 3600,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Nova Poshta postomates: ${response.statusText}`
            );
        }

        const data: NovaPoshtaResponse<WarehouseInfo> = await response.json();

        if (!data.success) {
            throw new Error(`Nova Poshta API error: ${data.errors.join(", ")}`);
        }

        return data.data
            .filter(
                (item) =>
                    item.TypeOfWarehouse ===
                    "f9316480-5f2d-425d-bc2c-ac7cd29decf0"
            )
            .map((item) => item.Description);
    } catch (error) {
        console.error("Error fetching Nova Poshta postomates:", error);
        throw error;
    }
}

// Функция для получения списка городов
export async function fetchNovaPoshaCities(
    params?: CitiesSearchParams
): Promise<CityInfo[]> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;
        if (!apiKey) {
            throw new Error("Nova Poshta API key is not configured");
        }

        const requestBody = {
            apiKey: apiKey,
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {
                FindByString: params?.searchQuery || "",
            },
        };

        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            next: {
                revalidate: Number(process.env.NEXT_PUBLIC_REVALIDATE) || 3600,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Nova Poshta cities: ${response.statusText}`
            );
        }

        const data: NovaPoshtaResponse<CityInfo> = await response.json();

        if (!data.success) {
            throw new Error(`Nova Poshta API error: ${data.errors.join(", ")}`);
        }

        return data.data;
    } catch (error) {
        console.error("Error fetching Nova Poshta cities:", error);
        throw error;
    }
}
