import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const studentPlans = [
    {
        id: 'student-free',
        name: 'Free',
        price: '0',
        description: 'Perfect for getting started',
        features: [
            { text: 'Basic job matching', included: true },
            { text: 'Resume builder', included: true },
            { text: 'Profile creation', included: true },
            { text: '3 applications / month', included: true },
            { text: 'Community support', included: true },
            { text: 'AI-powered matching', included: false },
            { text: 'Mock interviews', included: false },
            { text: 'Mentor sessions', included: false },
            { text: 'Portfolio hosting', included: false },
            { text: 'Priority support', included: false },
        ],
        cta: 'Get Started',
        highlighted: false,
    },
    {
        id: 'student-premium',
        name: 'Premium',
        price: '50',
        description: 'Everything you need to succeed',
        features: [
            { text: 'Everything in Free', included: true },
            { text: 'AI-powered job matching', included: true },
            { text: 'Unlimited applications', included: true },
            { text: 'Mock interview practice', included: true },
            { text: '2 mentor sessions / month', included: true },
            { text: 'Portfolio hosting', included: true },
            { text: 'Resume optimization', included: true },
            { text: 'Priority job alerts', included: true },
            { text: 'Interview prep', included: true },
            { text: 'Priority support', included: true },
        ],
        cta: 'Upgrade to Premium',
        highlighted: true,
        popular: true,
    },
];

export default function Pricing() {
    return (
        <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="mb-8 text-center"
                >
                    <h2 className="text-3xl font-semibold text-[#0F151D]">Choose your plan</h2>
                    <p className="text-sm text-[#6B7280] mt-2">Start free — upgrade when you're ready for more power.</p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                    {studentPlans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                        >
                            <Card
                                // IMPORTANT: overflow-visible lets the "POPULAR" badge sit outside the card bounds
                                className={`relative rounded-2xl overflow-visible ${plan.highlighted
                                    ? 'border-none bg-gradient-to-b from-[#FFF7F0] to-white'
                                    : 'border border-[#EFE9E0] bg-white'
                                    }`}
                            >
                                {/* Popular badge placed top-right and visible (not clipped) */}
                                {plan.popular && (
                                    <div
                                        className="absolute z-50 -top-3 right-4 px-3 py-1 text-[10px] font-semibold
                                                    bg-[#FFEEE0] text-[#D45F00] border border-[#FFD5B8]
                                                    rounded-full tracking-wide shadow-sm"
                                    >
                                        POPULAR
                                    </div>
                                )}

                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#0F151D]">{plan.name}</h3>
                                            <p className="text-sm text-[#6B7280] mt-1">{plan.description}</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-3xl font-extrabold text-[#0F151D]">{plan.price}</div>
                                            <div className="text-xs text-[#6B7280]">$/month</div>
                                        </div>
                                    </div>

                                    <ul className="grid gap-3 mt-6">
                                        {plan.features.map((f, idx) => (
                                            <li key={idx} className="flex items-center gap-3">
                                                <CheckCircle2
                                                    className={`w-5 h-5 flex-shrink-0 ${f.included ? 'text-[#FF7000]' : 'text-[#E6E6E6]'
                                                        }`}
                                                />
                                                <span className={`text-sm ${f.included ? 'text-[#0F151D]' : 'text-[#9CA3AF]'}`}>
                                                    {f.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={() => (window.location.href = '/pricing')}
                                            className={`px-6 py-2 rounded-md text-sm font-medium transition duration-300 ${plan.highlighted
                                                ? 'bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white shadow-sm'
                                                : 'bg-white text-[#284688] border border-[#E1E7F6] hover:bg-[#284688] hover:text-white'
                                                }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}