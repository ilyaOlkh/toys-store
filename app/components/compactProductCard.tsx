// CompactProductCard.tsx
import Image from "next/image";
import Price from "./price";

interface CompactProductCardProps {
    imageUrl: string;
    name: string;
    price: number;
    discount?: number;
    imgSize?: number;
}

const CompactProductCard: React.FC<CompactProductCardProps> = ({
    imageUrl,
    name,
    price,
    discount,
    imgSize = 50,
}) => {
    return (
        <div className="flex">
            <div className="flex-shrink-0 flex-grow-0 basis-[50px]">
                <Image
                    src={imageUrl}
                    alt="product img"
                    width={imgSize}
                    height={imgSize}
                />
            </div>
            <div className="overflow-hidden flex flex-col w-full">
                <div className="text-ellipsis text-nowrap overflow-hidden w-full">
                    {name}
                </div>
                <div className="text-black self-end">
                    <Price
                        firstPrice={`${price}`}
                        discountPrice={`${discount}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompactProductCard;
