import Carousel from "./components/Carousel";
import TrustMarquee from "./components/TrustMarquee";
import Heading from "./components/Heading";
import FeaturedProducts from "./components/FeaturedProducts";
import Explore from "./components/Explore";
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

      {/* 3. Products IMMEDIATELY on Top (Depth Reduced for Fast Buying) */}
      <div id="catalog-section">
        <Heading
          heading="Best-Selling Leather Goods"
          subHeading="100% Full-Grain Hide · Fast COD Delivery"
          description="Handcrafted in Pakistan with solid brass hardware, N52 magnetic ejection, and 10-year stitch warranty."
        />
        <FeaturedProducts />
      </div>

      {/* 4. Curated Leather Categories Grid */}
      <Heading
        heading="Explore Collections"
        subHeading="Bespoke Atelier Range"
        description="From ultra-slim MagFlap™ wallets to unbonded 3.8mm bridle belts, explore by craft category."
      />
      <Explore />

      {/* 5. Interactive Craftsmanship & Anatomy Breakdown */}
      <LeatherAnatomy />

      {/* 6. Interactive Patina Evolution Showcase */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-[#FAF8F5]">
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
