import CatLottie from '../components/Cat';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Error({ error }) {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-8 text-sm text-center md:text-base'>
            <CatLottie />
            <p className='font-medium text-7xl'>500</p>
            <h1 className='max-w-sm mx-auto mb-5 font-semibold text-destructive'>
                {error?.message ||
                    error?.name ||
                    "Something went wrong. Please refresh or try again later."}
            </h1>
            <Link to='/' className='font-medium text-[#FF7000]'>
                &larr; Go Back to Home
            </Link>
        </div>
    );
}