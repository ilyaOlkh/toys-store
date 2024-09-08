import Image from 'next/image';
import { fetchTypes } from './utils/fetch';
import TypeCard from './components/typeCard';
import HeroSection from './components/heroSection';

export default async function Home() {
    const types = await fetchTypes()

    if (types.length === 0) return <div>Loading...</div>;
    return (
        <div>
            <HeroSection />
            <div className='flex justify-center'>
                <div className='customContainer'>
                    <h1>Product Types</h1>
                    <ul className='flex gap-2 flex-wrap justify-around'>
                        {types ? types.map(type => (
                            <li key={type.id}>
                                <TypeCard typeObj={type} />
                            </li>
                        )) : <></>}
                    </ul>
                </div>
            </div>
        </div>
    );
}