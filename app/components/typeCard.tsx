import { types } from "@prisma/client";
import Link from "next/link";

export default function TypeCard({ typeObj }: { typeObj: types }) {
    const createFilterUrl = () => {
        const filters = {
            типи: [typeObj.name],
        };
        return `/products?filters=${encodeURIComponent(
            JSON.stringify(filters)
        )}`;
    };

    return (
        <Link
            href={createFilterUrl()}
            className="flex gap-2 flex-col max-w-48 w-full items-center text-center hover:opacity-80 transition-opacity"
        >
            {typeObj.image_blob && (
                <img src={typeObj.image_blob} alt={`${typeObj.name} type`} />
            )}
            <div>{typeObj.name}</div>
        </Link>
    );
}
