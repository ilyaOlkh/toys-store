import { ykrPoshta } from "../constants/ykrPoshtaConst";

export const getAllRegions = () => {
    return Object.keys(ykrPoshta);
};

export const getCitiesByRegion = (region: any) => {
    if (!(ykrPoshta as any)[region]) {
        return [];
    }

    const citiesObj = {};
    (ykrPoshta as any)[region].forEach((post: any) => {
        (citiesObj as any)[post.city] = true;
    });

    return Object.keys(citiesObj);
};

export const getAddressesByRegionAndCity = (region: any, city: any) => {
    if (!(ykrPoshta as any)[region]) {
        return [];
    }

    return (ykrPoshta as any)[region]
        .filter((post: any) => post.city === city)
        .map((post: any) => `${post.index}, ${post.city}, ${post.address}`);
};
