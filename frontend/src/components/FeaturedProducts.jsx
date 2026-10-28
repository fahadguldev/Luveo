import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import AnimatedTabs from "./motion/AnimatedTabs";

// Curated Fallback Leather Catalog
const CURATED_LEATHER_PRODUCTS = [
  {
    _id: "luveo-magflap-travel",
    name: "MagFlap™ Travel & Card Wallet",
    category: "magnetic-wallet",
    price: 5200,
    discountPrice: 4199,
    rating: 4.9,
    reviewCount: 148,
    stock: 15,
    colors: [
      {
        name: "Cognac Tan",
        hex: "#9B5A2B",
        images: [
          "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=600",
          "https://www.waldorleather.com/cdn/shop/files/travel_navy_grey_4.5.jpg?v=1752426246",
        ],
      },
      {
        name: "Obsidian Black",
        hex: "#101010",
        images: [
          "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=600",
        ],
      },
      {
        name: "Espresso Brown",
        hex: "#3D2817",
      },
    ],
  },
  {
    _id: "luveo-artisan-belt-brass",
    name: "Artisan Solid Brass Leather Belt",
    category: "leather-belts",
    price: 5800,
    discountPrice: 4699,
    rating: 5.0,
    reviewCount: 92,
    stock: 12,
    colors: [
      {
        name: "Dark Espresso",
        hex: "#2B1D12",
        images: [
          "https://images.unsplash.com/photo-1664286074176-5206ee5dc878?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=600&auto=format&fit=crop",
        ],
      },
      {
        name: "Classic Black",
        hex: "#111111",
      },
      {
        name: "Saddle Tan",
        hex: "#A36332",
      },
    ],
  },
  {
    _id: "luveo-classic-bifold-8card",
    name: "Heritage 8-Card Classic Bifold",
    category: "men-wallets",
    price: 4500,
    discountPrice: 3699,
    rating: 4.8,
    reviewCount: 84,
    stock: 20,
    colors: [
      {
        name: "Saddle Brown",
        hex: "#8A4F28",
        images: [
          "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop",
        ],
      },
      {
        name: "Midnight Black",
        hex: "#0F0F10",
      },
    ],
  },
  {
    _id: "luveo-executive-long-wallet",
    name: "Executive Long Passport Wallet",
    category: "long-wallet",
    price: 6800,
    discountPrice: 5499,
    rating: 4.9,
    reviewCount: 67,
    stock: 8,
    colors: [
      {
        name: "Burnished Tan",
        hex: "#9C6237",
        images: [
          "https://www.waldorleather.com/cdn/shop/collections/Untitled_design-59.png?v=1770982930&width=600",
        ],
      },
      {
        name: "Pitch Black",
        hex: "#121214",
      },
    ],
  },
  {
    _id: "luveo-laptop-sleeve-folio",
    name: "Full-Grain Leather Laptop Folio",
    category: "accessories",
    price: 8500,
    discountPrice: 6999,
    rating: 4.9,
    reviewCount: 43,
    stock: 10,
    colors: [
      {
        name: "Cognac Amber",
        hex: "#A05D2D",
        images: [
          "https://images.unsplash.com/photo-1611461527944-1a718332613b?q=80&w=600&auto=format&fit=crop",
        ],
      },
      {
        name: "Charcoal Black",
        hex: "#1B1B1C",
      },
    ],
  },
  {
    _id: "luveo-pebbled-leather-tote",
    name: "Verona Pebbled Leather Satchel",
    category: "women-bags",
    price: 14500,
    discountPrice: 11999,
    rating: 5.0,
    reviewCount: 31,
    stock: 6,
    colors: [
      {
        name: "Caramel",
        hex: "#B8753E",
        images: [
          "https://images.pexels.com/photos/23223837/pexels-photo-23223837.jpeg?auto=compress&cs=tinysrgb&w=600",
        ],
      },
      {
        name: "Onyx Black",
        hex: "#121212",
      },
    ],
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Craft" },
  { id: "magnetic-wallet", label: "MagFlap™" },
  { id: "leather-belts", label: "Belts" },
  { id: "men-wallets", label: "Classic Wallets" },
  { id: "long-wallet", label: "Travel & Long" },
  { id: "accessories", label: "Tech Folios" },
];

export const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/product/get-products?limit=12`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const fetched = data.products || [];
        if (isMounted) {
          if (fetched.length > 0) {
            setProducts(fetched);
          } else {
            setProducts(CURATED_LEATHER_PRODUCTS);
          }
        }
      } catch {
        if (isMounted) {
          setProducts(CURATED_LEATHER_PRODUCTS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      list = list.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        return cat === activeCategory || cat.includes(activeCategory);
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        return list.sort(
          (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
      case "price-high":
        return list.sort(
          (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
      case "rating":
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return list;
    }
  }, [products, activeCategory, sortBy]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F5]">
      <div className="max-w-[1440px] mx-auto">
        {/* Controls Bar: Category Tabs & Sort */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          {/* Animated Category Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none flex justify-start md:justify-center">
            <AnimatedTabs
              tabs={CATEGORY_TABS}
              activeTab={activeCategory}
              onTabChange={setActiveCategory}
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#736E66]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E3DDCF] rounded-xl px-4 py-2 text-xs font-semibold text-[#0D0C0B] outline-none shadow-sm cursor-pointer hover:border-[#9B5A2B] transition-colors"
            >
              <option value="featured">Featured Collection</option>
              <option value="rating">Top Rated & Verified</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-[#E8E2D6] animate-pulse h-96"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D6] p-8">
            <p className="text-lg font-bold text-[#0D0C0B]">
              No items in this category currently.
            </p>
            <p className="text-sm text-[#736E66] mt-1">
              Switch categories or check back soon for the next atelier restock.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#0D0C0B] text-white text-xs font-semibold uppercase tracking-wider"
            >
              View All Goods
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                loading={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
