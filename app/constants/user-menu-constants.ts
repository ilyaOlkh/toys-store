type MenuItem = {
    name: string;
    link: string;
};

export const MENU_ITEMS: { [key: string]: MenuItem } = {
    accountPage: { name: "Сторінка аккаунту", link: "/user" },
    ordersPage: { name: "Мої замовлення", link: "/orders" },
};

export const ADMIN_MENU_ITEMS: { [key: string]: MenuItem } = {
    ordersPage: { name: "Всі замовлення", link: "/orders/admin" },
};

export const MENU_ITEM_LOGOUT = { name: "Вийти", link: "/api/auth/logout" };
