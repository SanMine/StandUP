import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award, Sparkles, Target, Users } from 'lucide-react';

const whyStandUp = [
    {
        icon: Target,
        title: 'Personalized Guidance',
        description: 'Career roadmaps tailored to your goals and skills'
    },
    {
        icon: Sparkles,
        title: 'AI-Powered Matching',
        description: 'Smart algorithms connect you with perfect-fit opportunities'
    },
    {
        icon: Users,
        title: 'Expert Mentorship',
        description: 'Learn from industry professionals who have been there'
    },
    {
        icon: Award,
        title: 'Interview Preparation',
        description: 'Mock interviews and feedback to boost your confidence'
    }
];

export default function WhyStandUP() {
    return (
        <section className="px-6 py-32">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-bold text-[#0F151D] mb-4">
                        Why Stand Up?
                    </h2>
                    <p className="text-lg text-[#4B5563] max-w-2xl mx-auto mb-16">
                        Everything you need to go from student to professional
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {whyStandUp.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: index % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                            >
                                <Card className="border border-[#F3E7DD] bg-gradient-to-b from-white to-[#FFF8F2] rounded-2xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-center mb-4 rounded-lg h-14 w-14"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255,112,0,0.08), rgba(255,201,153,0.06))',
                                            }}
                                        >
                                            <Icon className="h-7 w-7 text-[#FF7000]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-[#4B5563]">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}