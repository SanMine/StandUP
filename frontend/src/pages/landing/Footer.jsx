import logo from "../../assets/standup_logo.svg";

import {
    FaTwitter,
    FaLinkedinIn,
    FaInstagram,
    FaGithub,
    FaEnvelope
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#0B0F14] to-[#0F151D] text-white py-16 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Brand / description / socials */}
                    <div className="flex flex-col gap-6 lg:col-span-5">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Stand Up Logo" className="w-auto h-10" />
                            <p className="font-semibold tracking-widest text-sm md:text-base font-mich text-[#FF7000]">
                                Stand<span className="text-[#274e9c]">UP</span>
                            </p>
                        </div>

                        <p className="max-w-md text-gray-300">
                            Empowering dreamers to achieve their career goals by connecting
                            them with real-world experience, expert mentors, and
                            career-changing opportunities.
                        </p>

                        {/* Social icons (react-icons) */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://twitter.com/"
                                aria-label="Stand Up on Twitter"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 transition rounded-full group bg-white/6 hover:bg-white/12"
                            >
                                <FaTwitter className="w-5 h-5 text-white/90 group-hover:text-white" />
                            </a>

                            <a
                                href="https://www.linkedin.com/"
                                aria-label="Stand Up on LinkedIn"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 transition rounded-full group bg-white/6 hover:bg-white/12"
                            >
                                <FaLinkedinIn className="w-5 h-5 text-white/90 group-hover:text-white" />
                            </a>

                            <a
                                href="https://www.instagram.com/"
                                aria-label="Stand Up on Instagram"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 transition rounded-full group bg-white/6 hover:bg-white/12"
                            >
                                <FaInstagram className="w-5 h-5 text-white/90 group-hover:text-white" />
                            </a>

                            <a
                                href="https://github.com/"
                                aria-label="Stand Up on GitHub"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 transition rounded-full group bg-white/6 hover:bg-white/12"
                            >
                                <FaGithub className="w-5 h-5 text-white/90 group-hover:text-white" />
                            </a>

                            <a
                                href="mailto:hello@standup.example"
                                aria-label="Email Stand Up"
                                className="p-2 transition rounded-full group bg-white/6 hover:bg-white/12"
                            >
                                <FaEnvelope className="w-5 h-5 text-white/90 group-hover:text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-7 sm:grid-cols-3">
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-gray-200">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-gray-200">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-gray-200">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col-reverse items-center justify-between gap-4 pt-8 mt-12 border-t border-t-gray-500 border-white/6 md:flex-row">
                    <p className="text-sm text-gray-400">© 2025 Stand Up. All rights reserved.</p>

                    <div className="flex items-center gap-4">
                        <a href="#" className="text-sm text-gray-300 transition hover:text-white">Privacy</a>
                        <span className="hidden text-gray-600 md:block">•</span>
                        <a href="#" className="text-sm text-gray-300 transition hover:text-white">Cookies</a>
                        <span className="hidden text-gray-600 md:block">•</span>
                        <a href="#" className="text-sm text-gray-300 transition hover:text-white">GDPR</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}