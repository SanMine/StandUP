import { Link } from 'react-router-dom'
import logo from "../../assets/standup_logo.svg"

export default function Logo() {
    return (
        <Link to={"/"} className="flex items-center gap-2">
            <img
                src={logo}
                alt="Stand Up Logo"
                className="h-8 md:h10 w-7 md:w-9"
            />
            <p className='font-semibold tracking-widest text-sm md:text-base font-mich text-[#FF7000]'>Stand<span className='text-[#274e9c]'>UP</span></p>
        </Link>
    )
}
