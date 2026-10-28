import { Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    id: 1,
    name: "Hamza Tariq",
    verified: true,
    location: "Lahore, PK",
    product: "MagFlap™ Travel Wallet",
    rating: 5,
    quote:
      "The magnetic snap has the most addictive tactile feel. You can smell the rich vegetable-tanned leather the second you open the box. Best wallet I’ve ever owned.",
    date: "Verified Buyer · 2 weeks ago",
  },
  {
    id: 2,
    name: "Daniyal Ahmed",
    verified: true,
    location: "Karachi, PK",
    product: "Artisan Solid Brass Belt",
    rating: 5,
    quote:
      "Unlike high-street belts that crack in 3 months, this is a single solid 3.8mm thick strip of full-grain hide. Solid brass buckle will easily outlive me.",
    date: "Verified Buyer · 1 month ago",
  },
  {
    id: 3,
    name: "Omar Farooq",
    verified: true,
    location: "Islamabad, PK",
    product: "Classic Bifold 8-Card",
    rating: 5,
    quote:
      "The saddle stitching is immaculate. It slid right into my suit pocket without bulging. After 6 months of daily carry, the patina looks stunning.",
    date: "Verified Buyer · 3 weeks ago",
  },
  {
    id: 4,
    name: "Zainab Malik",
    verified: true,
    location: "Rawalpindi, PK",
    product: "Pebbled Leather Laptop Sleeve",
    rating: 5,
    quote:
      "Bought this as a gift for my husband's 30th birthday. The packaging, leather aroma, and personalized feel made it feel like an ultra-luxury heritage brand.",
    date: "Verified Buyer · 1 month ago",
  },
];

export const CustomerReviews = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF8F5] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFECE5] border border-[#DDD6C8] text-[#9B5A2B] text-xs font-bold uppercase tracking-wider mb-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            4.9 / 5 Average Rating
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0D0C0B] font-[var(--font-display)]">
            Praised by Purists
          </h2>
          <p className="text-[#6D675E] text-sm sm:text-base mt-2">
            Read unfiltered impressions from individuals who value uncompromised leather craftsmanship.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl p-6 border border-[#E8E2D6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-shadow duration-300"
            >
              <div>
                {/* Rating & Product Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#9B5A2B] bg-[#FAF5EE] px-2.5 py-0.5 rounded-full border border-[#EBDDC8]">
                    {review.product}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-sm text-[#262421] leading-relaxed italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0D0C0B] flex items-center gap-1.5">
                    {review.name}
                    {review.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#9B5A2B]" />
                    )}
                  </h4>
                  <span className="text-[11px] text-[#8C867C]">{review.location}</span>
                </div>
                <span className="text-[10px] text-[#9C968C]">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
