import CTA from './landing/CTA';
import FAQ from './landing/FAQ';
import FeaturedJobs from './landing/FeaturedJobs';
import FeaturedMentors from './landing/FeaturedMentors';
import Footer from './landing/Footer';
import Hero from './landing/Hero';
import HowItWorks from './landing/HowItWorks';
import NavBar from './landing/NavBar';
import PartnerCompanies from './landing/PartnerCompanies';
import Pricing from './landing/Pricing';
import Testimonials from './landing/Testimonials';
import WhyStandUP from './landing/WhyStandUP';

const Landing = () => {
  return (
    <main className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <HowItWorks />
      <WhyStandUP />
      <FeaturedJobs />
      <FeaturedMentors />
      <PartnerCompanies />
      <Testimonials />
      <FAQ />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
};

export default Landing;