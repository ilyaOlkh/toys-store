import { OrderType } from "@/app/redux/ordersSlice";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ChevronDown } from "lucide-react";
import React from "react";
import {
    Clock,
    CreditCard,
    Phone,
    Mail,
    MapPin,
    Package,
    Truck,
    User,
    Calendar,
    ClipboardList,
    MessageCircle,
} from "lucide-react";
import Price from "../price";
import Image from "next/image";
import { delivery_method, order_status, payment_method } from "@prisma/client";

const getStatusColor = (status: order_status) => {
    switch (status) {
        case "pending":
            return "bg-amber-100 text-amber-700";
        case "processing":
            return "bg-blue-100 text-blue-700";
        case "shipped":
            return "bg-indigo-100 text-indigo-700";
        case "delivered":
            return "bg-green-100 text-green-700";
        case "cancelled":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getStatusLabel = (status: order_status) => {
    switch (status) {
        case "pending":
            return "Очікує обробки";
        case "processing":
            return "В обробці";
        case "shipped":
            return "Відправлено";
        case "delivered":
            return "Доставлено";
        case "cancelled":
            return "Скасовано";
        default:
            return status;
    }
};

const getPaymentMethodLabel = (method: payment_method) => {
    switch (method) {
        case "credit_card":
            return "Кредитна картка";
        case "credit_card_later":
            return "Картка при отриманні";
        case "cash":
            return "Готівка";
        default:
            return method;
    }
};

const getDeliveryMethodLabel = (method: delivery_method) => {
    switch (method) {
        case "nova_poshta":
            return "Нова Пошта";
        case "ukr_poshta":
            return "Укрпошта";
        case "pickup":
            return "Самовивіз";
        default:
            return method;
    }
};

const OrderCard = ({ order }: { order: OrderType }) => (
    <Accordion
        className="hover:shadow-lg transition-shadow duration-200"
        sx={{
            "&.MuiAccordion-root": {
                borderRadius: "0.5rem",
                "&:before": {
                    display: "none",
                },
            },
            "& .MuiAccordionSummary-root": {
                padding: "1.5rem",
            },
            "& .MuiAccordionDetails-root": {
                padding: "0 1.5rem 1.5rem 1.5rem",
            },
        }}
    >
        <AccordionSummary
            expandIcon={<ChevronDown className="w-5 h-5" />}
            aria-controls="order-content"
            className="flex items-center"
        >
            <div className="flex justify-between w-full gap-1 pr-2 flex-col-reverse items-start sm:items-center sm:flex-row sm:gap-4 ">
                <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                        <div className="font-semibold text-base break-all md:text-lg">
                            Замовлення #{order.order_id}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleString("uk-UA")}
                        </div>
                    </div>
                </div>
                <div
                    className={`px-4 py-2 rounded-full text-sm text-nowrap font-semibold ${getStatusColor(
                        order.status
                    )}`}
                >
                    {getStatusLabel(order.status)}
                </div>
            </div>
        </AccordionSummary>

        <AccordionDetails>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Клієнт */}
                <div className="flex gap-3">
                    <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">
                            Клієнт
                        </div>
                        <div className="font-medium">
                            {order.first_name} {order.last_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            {order.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {order.email}
                        </div>
                    </div>
                </div>

                {/* Доставка */}
                <div className="flex gap-3">
                    <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">
                            Доставка
                        </div>
                        <div className="font-medium">
                            {getDeliveryMethodLabel(order.delivery_method)}
                        </div>
                        {order.delivery_address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <MapPin className="w-4 h-4" />
                                {order.delivery_address}
                            </div>
                        )}
                        {(order.city || order.state) && (
                            <div className="text-sm text-gray-600">
                                {[order.city, order.state]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Оплата */}
                <div className="flex gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">
                            Оплата
                        </div>
                        <div className="font-medium">
                            {getPaymentMethodLabel(order.payment_method)}
                        </div>
                        <div className="text-sm mt-1">
                            {order.paid ? (
                                <span className="text-green-600 font-medium">
                                    Оплачено
                                </span>
                            ) : (
                                <span className="text-amber-600 font-medium">
                                    Не оплачено
                                </span>
                            )}
                        </div>
                        {order.payment_date && (
                            <div className="text-sm text-gray-600">
                                {new Date(
                                    order.payment_date
                                ).toLocaleDateString("uk-UA")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Товари */}
                <div className="flex gap-3">
                    <Package className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">
                            Товари
                        </div>
                        <div className="font-medium">
                            {order.products.length} позицій
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex flex-col gap-1">
                            {order.products.map((p) => (
                                <div
                                    key={p.id}
                                    className="relative flex gap-2 items-center"
                                >
                                    <div className="relative size-12 shrink-0 border rounded-lg">
                                        <div className="relative size-full">
                                            <Image
                                                src={
                                                    p.images[0] ??
                                                    "/noPhoto.png"
                                                }
                                                alt={p.product_name}
                                                fill
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <span>{`${p.product_name}, ${p.subtotal} ₴`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Сума */}
                <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">
                            Сума
                        </div>
                        <div className="font-bold text-lg">
                            <Price
                                discountPrice={String(order.total)}
                                firstPrice={String(order.subtotal)}
                                textSize="20"
                            />
                        </div>
                    </div>
                </div>

                {/* Примітки */}
                {order.notes && (
                    <div className="flex gap-3">
                        <MessageCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">
                                Примітки
                            </div>
                            <div className="text-sm text-gray-600">
                                {order.notes}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AccordionDetails>
    </Accordion>
);

export default OrderCard;
