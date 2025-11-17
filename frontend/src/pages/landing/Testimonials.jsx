import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
    {
        id: 1,
        name: 'Alex Thompson',
        role: 'Software Engineer at Meta',
        avatar: 'https://i.pravatar.cc/150?img=33',
        content: 'Stand Up completely transformed my job search. The AI matching connected me with opportunities I never would have found on my own, and the mentor sessions gave me the confidence I needed to ace my interviews.'
    },
    {
        id: 2,
        name: 'Priya Patel',
        role: 'Product Designer at Adobe',
        avatar: 'https://i.pravatar.cc/150?img=45',
        content: 'The personalized guidance and portfolio hosting features were game-changers for me. I landed my dream job within two months of joining Stand Up. Highly recommend to any student serious about their career!'
    },
    {
        id: 3,
        name: 'David Kim',
        role: 'Data Analyst at Amazon',
        avatar: 'https://i.pravatar.cc/150?img=15',
        content: "Stand Up's interview preparation tools and expert mentorship helped me overcome my anxiety and perform at my best. The platform is worth every penny, and the free tier is already incredibly valuable."
    },
    {
        id: 4,
        name: 'Sarah Mitchell',
        role: 'Marketing Manager at Netflix',
        avatar: 'https://i.pravatar.cc/150?img=47',
        content: 'The career guidance and networking opportunities on Stand Up opened doors I never knew existed. Within three months, I went from job searching to choosing between multiple offers from top tech companies!'
    },
    {
        id: 5,
        name: 'Michael Chen',
        role: 'Full Stack Developer at Google',
        avatar: 'https://i.pravatar.cc/150?img=12',
        content: 'As a recent graduate, Stand Up gave me the competitive edge I needed. The resume builder, mock interviews, and AI-powered job matching helped me land my dream role at Google on my first try!'
    }
];

export default function Testimonials() {
    const autoplay = React.useRef(
        Autoplay({
            delay: 4000,
            stopOnInteraction: false,
        })
    );

    return (
        <section className="px-6 py-32 bg-gradient-to-b from-white to-orange-50/30">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl font-bold text-[#0F151D] mb-3">
                        Success Stories
                    </h2>
                    <p className="text-lg text-[#4B5563]">See how Stand Up has transformed careers</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="px-4 lg:px-20"
                >
                    <Carousel
                        plugins={[autoplay.current]}
                        className="w-full"
                        onMouseEnter={autoplay.current.stop}
                        onMouseLeave={autoplay.current.reset}
                        opts={{
                            align: "center",
                            loop: true,
                        }}
                    >
                        <CarouselContent className="-ml-4">
                            {testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.id} className="pl-4">
                                    <div className="p-2">
                                        <Card className="border-2 border-[#FFE4CC] duration-300 bg-white">
                                            <CardContent className="p-10 text-center md:p-12">
                                                <div className="flex justify-center mb-6">
                                                    <div className="relative inline-block">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7000] to-[#FF9547] rounded-full blur-md opacity-20 scale-110"></div>
                                                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-[#FFE4CC] relative">
                                                            <AvatarImage
                                                                src={testimonial.avatar}
                                                                alt={testimonial.name}
                                                                loading="lazy"
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-[#FF7000] to-[#FF9547] text-white text-2xl font-semibold">
                                                                {testimonial.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center gap-1 mb-6">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="w-5 h-5 text-[#FF7000] fill-[#FF7000] drop-shadow-sm"
                                                        />
                                                    ))}
                                                </div>

                                                <div className="relative mb-8">
                                                    <p className="text-base md:text-lg text-[#0F151D] max-w-2xl mx-auto leading-relaxed px-4 pt-4">
                                                        {testimonial.content}
                                                    </p>
                                                </div>
                                                <div className="w-16 h-1 bg-gradient-to-r from-[#FF7000] to-[#FFE4CC] mx-auto mb-6 rounded-full"></div>
                                                <div>
                                                    <p className="font-bold text-lg text-[#0F151D] mb-1">
                                                        {testimonial.name}
                                                    </p>
                                                    <p className="text-sm text-[#4B5563] font-medium">
                                                        {testimonial.role}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious className="hidden lg:flex lg:items-center lg:justify-center -left-12 border-2 border-[#FFE4CC] bg-white hover:bg-[#FF7000] hover:text-white hover:border-[#FF7000] transition-all shadow-md" />
                        <CarouselNext className="hidden lg:flex lg:items-center lg:justify-center -right-12 border-2 border-[#FFE4CC] bg-white hover:bg-[#FF7000] hover:text-white hover:border-[#FF7000] transition-all shadow-md" />
                    </Carousel>
                </motion.div>
            </div>
        </section>
    );
}