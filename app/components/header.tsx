import Image from "next/image";
import CartIcon from "./cartIcon";
import SearchBar from "./search";
import { Menu } from "@mui/icons-material";
import MenuButton from "./menuButton";
import { Claims, getSession } from "@auth0/nextjs-auth0";
import UserMenu from "./userMenu";

export default async function Header() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user;
    }

    return (
        <header>
            <div className="bg-blue1 min-h-14 bg-repeat-x flex justify-center pt-3.5 items-start relative before:bg-[url(/header-decor.svg)] before:h-[30px] before:w-full before:absolute before:bottom-0 before:translate-y-1/2">
                <div className="customContainer flex justify-between text-white1 font-bold gap-3 items-center">
                    <div className="flex items-center gap-3 z-1 relative">
                        <Image
                            src="/free-shipping.svg"
                            alt="free shiping icon"
                            width={28}
                            height={20}
                        />
                        <span>Free free shipping with over $150</span>
                    </div>
                    <div className="hidden items-center  gap-10 z-1 relative md:flex">
                        {user ? (
                            <UserMenu
                                username={user.name}
                                avatarUrl={user.picture}
                            />
                        ) : (
                            // <div>{user.name}</div>
                            <>
                                <a href="/api/auth/login">Login</a>
                                <a href="/api/auth/signup">Register</a>
                            </>
                        )}
                    </div>
                    <div className="block md:hidden">
                        <MenuButton />
                    </div>
                </div>
            </div>
            <div className="py-10 flex justify-center">
                <div className="customContainer flex gap-2 items-center justify-between">
                    <a
                        href="/"
                        className="w-12 overflow-hidden sm:w-[144px] flex-shrink-0"
                    >
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={144}
                            height={53}
                            className="w-[144px] max-w-[144px] cursor-pointer"
                        />
                    </a>
                    <ul className="hidden gap-2 max-w-[532px] font-bold w-full justify-around flex-shrink basis-[532px] md:flex">
                        <a href="/" className="block p-1">
                            <li>Home</li>
                        </a>
                        <a href="/products" className="block  p-1">
                            <li>Shop</li>
                        </a>
                        <a href="/pages" className="block p-1">
                            <li>Pages</li>
                        </a>
                        <a href="/blog" className="block p-1">
                            <li>Blog</li>
                        </a>
                        <a href="/contact" className="block p-1">
                            <li>Contact</li>
                        </a>
                    </ul>
                    <div className="flex flex-shrink basis-[332px] gap-2 items-center md:gap-6 md:flex-shrink-[0.5]">
                        <div className="order-2 pr-3 md:order-1">
                            <CartIcon />
                        </div>
                        <div className="order-1 md:order-2">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
