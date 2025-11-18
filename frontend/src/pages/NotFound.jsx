import { Link } from "react-router-dom";
import CatLottie from "../components/Cat";

function NotFound() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-8 text-sm text-center md:text-base'>
            <CatLottie />
            <p className='font-medium text-7xl'>404</p>
            <p className='max-w-sm mx-auto mb-5'>The page you are looking for doesn&apos;t exist. Please return to the homepage.</p>
            <Link to='/' className='font-medium text-[#FF7000]'>
                &larr; Go Back
            </Link>
        </div>
    );
}

export default NotFound;


