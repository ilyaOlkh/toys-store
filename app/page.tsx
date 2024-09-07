import Image from 'next/image';
import { fetchTypes } from './utils/fetch';
import TypeCard from './components/typeCard';

export default async function Home() {
    const types = await fetchTypes()

    if (types.length === 0) return <div>Loading...</div>;

    return (
        <div>
            <h1>Product Types</h1>
            <ul>
                {types ? types.map(type => (
                    <li key={type.id}>
                        <TypeCard typeObj={type} />
                    </li>
                )) : <></>}
            </ul>
        </div>
    );
}