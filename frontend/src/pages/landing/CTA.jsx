import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
    const navigate = useNavigate()

    return (
        <section className="py-32 px-6 bg-gradient-to-r from-[#284688] to-[#3a5ba0]">
            <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-4 text-4xl font-bold text-white"

                >
                    Ready to Stand Up for Your Future?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="max-w-2xl mx-auto mb-8 text-white/90"
                >
                    Join thousands of students who are already on their path to success. Get personalized career guidance,
                    connect with top employers, and access expert mentorship
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Button
                        onClick={() => navigate('/auth')}
                        size="lg"
                        className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-12 py-6 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
