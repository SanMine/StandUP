import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion';
import { GiSparkles } from "react-icons/gi";

export default function Hero() {
    return (
        <section className="px-6 pt-32 pb-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-block"
                        >
                            <Badge className="bg-[#FFE4CC] text-[#FF7000] flex items-center gap-2 hover:bg-[#FFE4CC] px-4 py-1.5 text-sm font-medium">
                                <GiSparkles className='size-5' /> Career Development Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl lg:text-5xl font-bold text-[#0F151D] leading-tight"
                        >
                            To every dreamer chasing their future,{' '}
                            <span className="text-[#FF7000]">Stand<span className="text-[#274e9c]">UP!</span></span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="text-lg text-[#4B5563] max-w-xl leading-relaxed"
                        >
                            Bridge the gap between ambition and opportunity. Get job-ready with personalized guidance, AI matching, and expert mentorship.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Button
                                onClick={() => navigate('/auth?role=student')}
                                size="lg"
                                className=" bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white px-8 py-6 font-medium rounded-full text-[17px] shadow-lg hover:shadow-xl transition-all"
                            >
                                I'm a Student
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                onClick={() => navigate('/auth?role=employer')}
                                size="lg"
                                variant="outline"
                                className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white text-[17px] px-8 py-6 font-medium rounded-full transition-all"
                            >
                                I'm an Employer
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&auto=format&q=80"
                            alt="Students pursuing careers"
                            className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                            loading="eager"
                        />
                        <div className="absolute max-w-xs p-4 bg-white shadow-xl -bottom-6 -left-6 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">2,500+ Students</p>
                                    <p className="text-xs text-gray-600">Landed their dream jobs</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
