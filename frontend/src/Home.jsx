import Carousel from "./components/Carousel";
import TrustMarquee from "./components/TrustMarquee";
import Heading from "./components/Heading";
import Explore from "./components/Explore";
import FeaturedProducts from "./components/FeaturedProducts";
import LeatherAnatomy from "./components/motion/LeatherAnatomy";
import InteractivePatinaSlider from "./components/motion/InteractivePatinaSlider";
import CustomerReviews from "./components/CustomerReviews";
import RestockShowcase from "./components/RestockShowcase";
import ExploreWithUs from "./components/ExploreWithUs";

export const Home = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#0D0C0B]">
      {/* 1. Framer Luxury Hero Carousel */}
      <Carousel />

      {/* 2. Leather Hallmarks Infinite Marquee */}
      <TrustMarquee />

      {/* 3. Curated Leather Categories Grid */}
      <Heading
        heading="Curated Leather Goods"
        subHeading="Proudly Handcrafted in Pakistan"
        description="Designed with minimal lines and maximum utility. Explore our signature magnetic wallets, full-grain belts, and travel organizers."
      />
      <Explore />

      {/* 4. Interactive Craftsmanship & Anatomy Breakdown */}
      <LeatherAnatomy />

      {/* 5. Signature Collection Grid with Animated Category Tabs */}
      <Heading
        heading="The 2026 Atelier Catalog"
        subHeading="Engineered For Everyday Carry"
        description="Every piece is hand-burnished with natural carnauba beeswax and backed by our 10-year craftsmanship guarantee."
      />
      <FeaturedProducts />

      {/* 6. Interactive Patina Evolution Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#FAF8F5]">
        <InteractivePatinaSlider />
      </section>

      {/* 7. Verified Customer Reviews */}
      <CustomerReviews />

      {/* 8. Small-Batch Drops & Restock Showcase */}
      <Heading
        heading="Upcoming Small-Batch Drops"
        subHeading="Limited Editions"
        description="Pre-reserve upcoming atelier creations handcrafted in strictly numbered quantities."
      />
      <RestockShowcase />

      {/* 9. VIP Atelier Society Newsletter */}
      <ExploreWithUs />
    </div>
  );
};

export default Home;
