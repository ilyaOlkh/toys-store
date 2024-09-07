'use client'
import React, { useState } from 'react';
import { Search } from '@mui/icons-material';

const SearchBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);

    // Пример данных для поиска
    const sampleData = ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple', 'Grapes'];

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);

        // Фильтрация результатов поиска
        if (query) {
            const results = sampleData.filter(item =>
                item.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleSearch = () => {
        console.log('Поиск выполнен:', searchQuery);
    };

    return (
        <div className="relative">
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
                    onClick={handleSearch}
                    className="bg-blue1 text-white p-3 rounded-full transition-colors"
                >
                    <Search />
                </button>
            </div>

            {/* Выпадающее меню с результатами поиска */}
            {searchResults.length > 0 && (
                <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {searchResults.map((result, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => console.log('Selected:', result)}
                        >
                            {result}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;