import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const featuredMentors = [
    {
        id: 1,
        name: 'Sarah Johnson',
        title: 'Senior Software Engineer',
        company: 'Google',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4.9,
        sessions: 127,
        expertise: ['Career Planning', 'Technical Interviews']
    },
    {
        id: 2,
        name: 'Michael Chen',
        title: 'Product Manager',
        company: 'Microsoft',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4.8,
        sessions: 98,
        expertise: ['Product Strategy', 'Leadership']
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        title: 'UX Design Lead',
        company: 'Apple',
        avatar: 'https://i.pravatar.cc/150?img=9',
        rating: 5.0,
        sessions: 156,
        expertise: ['Design Thinking', 'Portfolio Review']
    }
];

export default function FeaturedMentors() {
    return (
        <section className="px-6 py-32">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold text-[#0F151D] mb-4">Learn from the Best</h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="text-[#4B5563] text-center mb-16"
                >
                    Connect with industry experts who can guide your journey
                </motion.p>

                <div className="grid gap-8 md:grid-cols-3">
                    {featuredMentors.map((mentor, index) => (
                        <motion.div
                            key={mentor.id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <Card className="rounded-2xl border border-[#EFE7DF] p-6">
                                <CardContent className="p-0">
                                    <div className="flex flex-col items-center text-center">
                                        <Avatar className="h-28 w-28 mb-4 border-4 border-[#FFE8D3] shadow-sm">
                                            <AvatarImage src={mentor.avatar} alt={mentor.name} loading="lazy" />
                                            <AvatarFallback className="bg-[#FF7000] text-white text-3xl">
                                                {mentor.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <h3 className="text-xl font-semibold text-[#0F151D] mb-1">
                                            {mentor.name}
                                        </h3>
                                        <p className="text-sm text-[#4B5563] mb-1">{mentor.title}</p>
                                        <p className="text-xs text-[#FF7000] font-medium mb-4">{mentor.company}</p>

                                        <div className="flex items-center justify-center gap-1 mb-4">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-medium">{mentor.rating}</span>
                                            <span className="text-xs text-[#4B5563]">
                                                ({mentor.sessions} sessions)
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                                            {mentor.expertise.map((exp) => (
                                                <Badge
                                                    key={exp}
                                                    variant="subtle"
                                                    className="text-xs px-3 py-1 bg-white border border-[#F4DCC4] text-[#FF7A2D] rounded-md"
                                                >
                                                    {exp}
                                                </Badge>
                                            ))}
                                        </div>
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