type MenuItem = {
    name: string;
    link: string;
};

export const MENU_ITEMS: { [key: string]: MenuItem } = {
    accountPage: { name: "Сторінка аккаунту", link: "/user" },
};

export const MENU_ITEM_LOGOUT = { name: "Вийти", link: "/api/auth/logout" };
