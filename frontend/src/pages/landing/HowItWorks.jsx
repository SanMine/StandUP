import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

const howItWorks = [
    {
        icon: Target,
        title: 'Tell Us Your Goals',
        description: 'Share your skills, interests, and career aspirations with us'
    },
    {
        icon: Sparkles,
        title: 'Get AI-Matched',
        description: 'Our AI analyzes your profile and finds opportunities that fit you perfectly'
    },
    {
        icon: TrendingUp,
        title: 'Grow & Succeed',
        description: 'Prepare for interviews, apply with confidence, and land your dream opportunity'
    }
];

export default function HowItWorks() {
    return (
        <section className="py-32 px-6 bg-[#FFFDFA]">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-bold text-[#0F151D] mb-4" >
                        How It Works
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-lg text-[#4B5563] max-w-2xl mx-auto mb-16 text-center"
                >
                    Three simple steps to launch your career
                </motion.p>

                <div className="grid gap-8 md:grid-cols-3">
                    {howItWorks.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
                            >
                                <Card className="relative h-full border-2 border-[#E5E7EB] bg-white rounded-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="absolute -translate-x-1/2 -top-6 left-1/2">
                                            <div className="h-12 w-12 bg-gradient-to-br from-[#FF7000] to-[#FF9040] rounded-full flex items-center justify-center shadow-md">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E8F0FF] text-[#284688] font-bold text-sm mb-4">
                                                {index + 1}
                                            </div>
                                            <h3 className="text-xl font-semibold text-[#0F151D] mb-3" >
                                                {step.title}
                                            </h3>
                                            <p className="text-[#4B5563] leading-relaxed">{step.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}