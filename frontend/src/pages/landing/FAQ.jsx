import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        question: "How does Stand Up help me find the right job?",
        answer: "Stand Up uses AI-powered matching to connect you with opportunities that align with your skills, interests, and career goals. Our platform analyzes your profile and matches you with the most suitable positions."
    },
    {
        question: "Is Stand Up free to use?",
        answer: "Yes! Stand Up offers a free plan that includes basic job matching, resume building, and profile creation. You can upgrade to Premium for advanced features like AI-powered matching, unlimited applications, and mentor sessions."
    },
    {
        question: "How do mentor sessions work?",
        answer: "Premium members get access to industry experts who provide personalized guidance. You can book one-on-one sessions to discuss your career path, get resume feedback, practice interviews, and receive valuable insights."
    },
    {
        question: "Can employers see my profile?",
        answer: "Your profile is only visible to employers when you apply for their jobs. You have full control over what information you share and can update your privacy settings at any time."
    },
    {
        question: "What makes Stand Up different from other job platforms?",
        answer: "Stand Up is specifically designed for students and recent graduates. We offer personalized career guidance, AI matching, expert mentorship, interview preparation, and portfolio hosting - all in one platform to help you transition from student to professional."
    }
];

export default function FAQ() {
    const [openFAQ, setOpenFAQ] = useState(null);

    return (
        <section id='faq' className="py-32 px-6 bg-[#FFFDFA]">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-3xl font-bold text-[#0F151D] mb-2" >
                        Frequently Asked Questions
                    </h2>
                    <p className="text-[#4B5563]">Everything you need to know about Stand Up</p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden border-none">
                                <button
                                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                    className="flex items-center justify-between w-full p-6 text-left transition-colors bg-gray-50"
                                >
                                    <h3 className="text-lg font-semibold text-[#0F151D] pr-4">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openFAQ === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-[#FF7000] flex-shrink-0" />
                                    </motion.div>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openFAQ === index ? "auto" : 0,
                                        opacity: openFAQ === index ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 text-[#4B5563]">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
