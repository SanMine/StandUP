import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const featuredJobs = [
    {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        logo: 'https://ui-avatars.com/api/?name=TC&background=4F46E5&color=fff&size=48',
        type: 'Full-time',
        location: 'Remote',
        salary: '$80k - $120k',
        skills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL']
    },
    {
        id: 2,
        title: 'UX/UI Designer',
        company: 'DesignHub',
        logo: 'https://ui-avatars.com/api/?name=DH&background=EC4899&color=fff&size=48',
        type: 'Full-time',
        location: 'Bangkok',
        salary: '$60k - $90k',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping']
    },
    {
        id: 3,
        title: 'Software Engineering Intern',
        company: 'StartupXYZ',
        logo: 'https://ui-avatars.com/api/?name=SX&background=10B981&color=fff&size=48',
        type: 'Internship',
        location: 'Hybrid',
        salary: '$2k - $3k/month',
        skills: ['Python', 'Django', 'REST API', 'PostgreSQL']
    }
];

export default function FeaturedJobs() {

    return (
        <section id='featured-jobs' className="py-32 px-6 bg-[#FFFDFA]">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between mb-12"
                >
                    <div>
                        <h2 className="text-3xl font-bold text-[#0F151D] mb-2">
                            Explore Opportunities
                        </h2>
                        <p className="text-[#4B5563]">Latest internships and jobs waiting for you</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-[#FF7000] hover:text-[#FF7000]/90 hover:bg-[#FFE4CC]"
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-3">
                    {featuredJobs.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            {/* Clean elegant card — NO shadow, NO hover, soft gradient */}
                            <Card className="border border-[#F3E7DD] rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <img
                                            src={job.logo}
                                            alt={job.company}
                                            className="object-cover w-12 h-12 rounded-lg"
                                            loading="lazy"
                                        />
                                        <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                                            {job.type}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-semibold text-[#0F151D] mb-1">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-[#4B5563] mb-4">{job.company}</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.skills.slice(0, 3).map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="outline"
                                                className="text-xs border-[#F2DCC4]"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#4B5563]">{job.location}</span>
                                        <span className="text-sm font-medium text-[#FF7000]">{job.salary}</span>
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