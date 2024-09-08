'use client'
import React, { useState } from 'react';
import { Search } from '@mui/icons-material';
import Image from 'next/image';

interface IProduct {
    id: number;
    name: string;
    price: number;
    discount: number;
    description: string | null;
    stock_quantity: number;
    sku_code: string;
    created_at: Date;
    imageUrl: string;
}

const minLen = 3

const SearchBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<IProduct[]>([]);
    const [searchInFocus, setSearchInFocus] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleBlur = (event: React.FocusEvent) => {
        console.log(event.relatedTarget)
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setSearchInFocus(false);
        }
    };

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.length > minLen) {
            setLoading(true);

            try {
                // Выполнение запроса к вашему API
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/products/search/${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setSearchResults([]);
        }
    };
    return (
        <div
            className="relative  font-semibold"
            onFocus={() => setSearchInFocus(true)}
            onBlur={handleBlur}
        >
            {/* Поле поиска */}
            <div className="flex items-center border-2 border-lightGray1 rounded-full w-full font-semibold ">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-4 py-2 rounded-full text-gray1 focus:outline-none placeholder:text-gray1 w-full"
                />
                <button
                    className="bg-blue1 text-white p-3 rounded-full transition-colors"
                >
                    <Search />
                </button>
            </div>

            {/* Выпадающее меню с результатами поиска */}
            {searchInFocus && (
                <ul className="absolute top-full right-1/2 translate-x-1/2 mt-2 md:translate-x-0 md:right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-auto min-w-[250px] w-full">
                    {
                        searchQuery.length > minLen ?
                            !loading ?
                                searchResults.length > 0 ? searchResults.map((result, index) => (
                                    <li
                                        key={index}
                                        className="p-2 hover:bg-gray-100 transition-colors "
                                        onClick={() => console.log('Selected:', result)}
                                    >
                                        <a href={`/products/${result.id}`} className='flex items-center gap-1'>
                                            <Image src={result.imageUrl} alt='product img' width={50} height={50} />
                                            <div className='line-clamp-2'>
                                                {result.name}
                                            </div>
                                        </a>
                                    </li>
                                )) : <li className="px-4 py-2">
                                    Немає результатів
                                </li>
                                : <li className="px-4 py-2">
                                    завантаження...
                                </li>
                            : <li className="px-4 py-2">
                                {'Необхідна кількість символів: ' + (minLen + 1)}
                            </li>

                    }
                </ul>
            )}
        </div>
    );
};

export default SearchBar;