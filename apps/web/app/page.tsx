import Header from '@/components/Header';
import StatusBanner from '@/components/StatusBanner';
import Hero from '@/components/Hero';
import About from '@/components/About';
import MenuSection from '@/components/MenuSection';
import Featured from '@/components/Featured';
import GallerySection from '@/components/GallerySection';
import Testimonials from '@/components/Testimonials';
import Location from '@/components/Location';
import Hours from '@/components/Hours';
import Contact from '@/components/Contact';
import Reservation from '@/components/Reservation';
import Footer from '@/components/Footer';
import MobileCallBar from '@/components/MobileCallBar';

export default function Home(): React.ReactElement {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-primary focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header />
      <StatusBanner />
      <main id="main">
        <Hero />
        <About />
        <MenuSection />
        <Featured />
        <GallerySection />
        <Testimonials />
        <Location />
        <Hours />
        <Contact />
        <Reservation />
      </main>
      <Footer />
      <MobileCallBar />
    </>
  );
}
