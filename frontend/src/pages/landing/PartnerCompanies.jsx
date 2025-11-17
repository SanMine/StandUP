import { motion } from 'framer-motion';

const partnerCompanies = [
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' }
];

export default function PartnerCompanies() {
    return (
        <section className="py-16 my-32 px-6 bg-[#FFFDFA] overflow-hidden">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-2xl font-bold text-[#0F151D] mb-2" >
                        Trusted by Leading Companies
                    </h2>
                </motion.div>

                <div className="relative">
                    <motion.div
                        animate={{
                            x: [0, -1600]
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 20,
                                ease: "linear"
                            }
                        }}
                        className="flex gap-12"
                    >
                        {[...partnerCompanies, ...partnerCompanies].map((company, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-center flex-shrink-0 w-32 group"
                            >
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="object-contain h-12 transition-all grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                                    loading="lazy"
                                    width="120"
                                    height="48"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
