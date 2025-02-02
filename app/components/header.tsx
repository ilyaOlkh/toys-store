import Image from "next/image";
import CartIcon from "./cartIcon";
import SearchBar from "./search";
import MenuButton from "./menuButton";
import { Claims, getSession } from "@auth0/nextjs-auth0";
import UserMenu from "./userMenu";
import { routes } from "../constants/routes-constants";
import FavoriteIcon from "./favoriteIcon";
import { FREE_DELIVERY_THRESHOLD } from "../utils/delivery";

export default async function Header() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user;
    }

    return (
        <header>
            <div className="bg-blue1 min-h-10 bg-repeat-x flex justify-center pt-1.5 items-start relative before:bg-[url(/header-decor.svg)] before:h-[15px] before:w-full before:absolute before:bottom-0 before:translate-y-full before:scale-y-[-1]">
                <div className="customContainer flex justify-between text-white1 font-bold gap-3 items-center">
                    <div className="flex items-center gap-3 z-1 relative">
                        <Image
                            src="/free-shipping.svg"
                            alt="free shiping icon"
                            width={28}
                            height={20}
                        />
                        <span>
                            {`Безкоштовна доставка при замовленні від\u00A0${FREE_DELIVERY_THRESHOLD}\u00A0UAH`}
                        </span>
                    </div>
                    <div className="hidden items-center  gap-10 z-1 relative md:flex">
                        {user ? (
                            <UserMenu username={user.name} />
                        ) : (
                            <>
                                <a href={routes.login}>Login</a>
                                <a href={routes.register}>Register</a>
                            </>
                        )}
                    </div>
                    <div className="block md:hidden">
                        <MenuButton />
                    </div>
                </div>
            </div>
            <div className="pt-6 pb-3 flex justify-center">
                <div className="customContainer flex gap-2 items-center justify-between">
                    <a
                        href="/"
                        className="w-12 overflow-hidden sm:w-[195px] flex-shrink-0"
                    >
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={195}
                            height={53}
                            className="w-[195px] max-w-[195px] cursor-pointer"
                        />
                    </a>
                    <div className="flex flex-shrink gap-2 items-center">
                        <ul className="hidden gap-4 font-bold w-full justify-end flex-shrink md:flex">
                            <a href="/" className="block p-1">
                                <li>Головна</li>
                            </a>
                            <a href="/products" className="block  p-1">
                                <li>Магазин</li>
                            </a>
                            <a href="/contact" className="block p-1">
                                <li>Контакти</li>
                            </a>
                        </ul>
                        <div className="order-2 pr-0 md:order-1">
                            <CartIcon />
                        </div>
                        <div className="order-2 pr-0 md:order-1">
                            <FavoriteIcon />
                        </div>
                        <div className="order-1 md:order-2 basis-96">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
