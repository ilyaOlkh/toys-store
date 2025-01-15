import React from "react";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="py-16 relative">
            <Image
                src="/footer-bg.png"
                alt="background"
                fill
                className="object-cover pointer-events-none select-none -z-10 object-bottom"
                priority={false}
                quality={100}
            />
            <div className="customContainer mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Логотип и описание */}
                    <div className="col-span-1">
                        <div className="mb-4">
                            <Image
                                src="/logo.png"
                                alt="logo"
                                width={195}
                                height={53}
                                className="w-[195px] max-w-[195px] cursor-pointer"
                            />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Найкращі іграшки для розвитку та веселощів вашої
                            дитини
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="#"
                                className="bg-[#FFE8EC] p-2 rounded-full hover:bg-[#FFD1DB] transition-colors"
                            >
                                <Instagram className="w-5 h-5 text-gray-700" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-[#E8F4FF] p-2 rounded-full hover:bg-[#D1E9FF] transition-colors"
                            >
                                <Twitter className="w-5 h-5 text-gray-700" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-[#E8ECFF] p-2 rounded-full hover:bg-[#D1DBFF] transition-colors"
                            >
                                <Facebook className="w-5 h-5 text-gray-700" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-[#FFE8EC] p-2 rounded-full hover:bg-[#FFD1DB] transition-colors"
                            >
                                <Linkedin className="w-5 h-5 text-gray-700" />
                            </Link>
                        </div>
                    </div>

                    {/* Мій акаунт */}
                    <div className="col-span-1">
                        <h3 className="font-bold text-gray-800 mb-4">
                            Мій акаунт
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/track-order"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Відстежити замовлення
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Умови використання
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/wishlist"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Список бажань
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/feedback"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Залишити відгук
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Служба підтримки */}
                    <div className="col-span-1">
                        <h3 className="font-bold text-gray-800 mb-4">
                            Служба підтримки
                        </h3>
                        <ul className="space-y-2">
                            <li className="text-gray-600">
                                Понеділок - П'ятниця
                            </li>
                            <li className="text-gray-600">
                                10:00 - 18:00 (Київський час)
                            </li>
                            <li>
                                <Link
                                    href="tel:+380123456789"
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    Тел.: +38 (012) 345-67-89
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="mailto:info@example.com"
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    Email: info@example.com
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Пустая колонка для баланса */}
                    <div className="col-span-1"></div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
