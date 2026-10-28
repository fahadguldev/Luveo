import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";

// Curated Leather Fallback Catalog
const FALLBACK_LEATHER_PRODUCTS = [
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
      { name: "Obsidian Black", hex: "#101010" },
      { name: "Espresso Brown", hex: "#3D2817" },
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
      { name: "Classic Black", hex: "#111111" },
      { name: "Saddle Tan", hex: "#A36332" },
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
        ],
      },
      { name: "Midnight Black", hex: "#0F0F10" },
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
      { name: "Pitch Black", hex: "#121214" },
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
    ],
  },
];

const CATEGORY_NAMES = {
  "magnetic-wallet": "MagFlap™ & Magnetic Wallets",
  "leather-belts": "Artisan Full-Grain Belts",
  "men-wallets": "Classic Bifolds & Cardholders",
  "long-wallet": "Executive Long & Travel Wallets",
  "women-bags": "Women's Leather Bags",
  accessories: "Tech Folios & EDC Accessories",
};

export const AllProducts = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(category ? category.toLowerCase() : "");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (typeof urlSearch === "string") {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category.toLowerCase());
    } else {
      setSelectedCategory("");
    }
  }, [category]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/product`;
      const endpoint = category
        ? `${baseUrl}/categories/${category.toLowerCase()}`
        : `${baseUrl}/get-products`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const fetched = data.products || [];

      if (fetched.length > 0) {
        setProducts(fetched);
      } else {
        let fallback = FALLBACK_LEATHER_PRODUCTS;
        if (category) {
          fallback = fallback.filter(
            (p) => (p.category || "").toLowerCase() === category.toLowerCase()
          );
        }
        setProducts(fallback);
      }
    } catch {
      let fallback = FALLBACK_LEATHER_PRODUCTS;
      if (category) {
        fallback = fallback.filter(
          (p) => (p.category || "").toLowerCase() === category.toLowerCase()
        );
      }
      setProducts(fallback);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(lower) ||
          product.description?.toLowerCase().includes(lower) ||
          product.category?.toLowerCase().includes(lower)
      );
    }

    // Category filter
    if (selectedCategory && !category) {
      const norm = selectedCategory.toLowerCase();
      result = result.filter(
        (product) => String(product.category || "").toLowerCase() === norm
      );
    }

    // Sort
    switch (sortBy) {
      case "priceAsc":
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "priceDesc":
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "popular":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy, category]);

  const clearFilters = () => {
    setSearchTerm("");
    if (!category) setSelectedCategory("");
    setSortBy("newest");
  };

  const pageTitle = category
    ? CATEGORY_NAMES[category.toLowerCase()] || `${category} Collection`
    : "The Complete Leather Atelier";

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 sm:pt-36 pb-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B5A2B] block mb-2 font-[var(--font-sans)]">
            100% Certified Full-Grain Cowhide
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D0C0B] tracking-tight font-[var(--font-display)]">
            {pageTitle}
          </h1>
          <p className="text-[#736E66] text-sm sm:text-base mt-2.5">
            Handcrafted with organic vegetable tannins, heavy-duty saddle stitching, and solid brass hardware.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867C]" />
              <input
                type="text"
                placeholder="Search wallets, belts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B]"
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={Boolean(category)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-semibold text-[#0D0C0B] outline-none cursor-pointer disabled:opacity-60"
              >
                <option value="">All Leather Categories</option>
                <option value="magnetic-wallet">MagFlap™ Wallets</option>
                <option value="leather-belts">Artisan Belts</option>
                <option value="men-wallets">Classic Bifolds</option>
                <option value="long-wallet">Long Travel Wallets</option>
                <option value="accessories">Tech Folios & Accessories</option>
                <option value="women-bags">Women&apos;s Bags</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-semibold text-[#0D0C0B] outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="popular">Sort: Top Rated</option>
                <option value="priceAsc">Sort: Price Low to High</option>
                <option value="priceDesc">Sort: Price High to Low</option>
              </select>
            </div>

            {/* Clear / Reset */}
            <div>
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8E2D6] bg-white hover:bg-[#0D0C0B] hover:text-white text-xs font-semibold text-[#0D0C0B] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#736E66] font-medium mb-6 px-1">
          <span>
            Displaying {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "leather creation" : "leather creations"}
          </span>
          {category && (
            <span className="text-[#9B5A2B] font-semibold uppercase tracking-wider">
              Category: {category}
            </span>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skel-${idx}`}
                className="bg-white rounded-3xl p-5 border border-[#E8E2D6] animate-pulse h-96"
              />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} loading={false} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#E8E2D6] p-8">
              <h3 className="text-xl font-bold text-[#0D0C0B]">No creations found</h3>
              <p className="text-sm text-[#736E66] mt-2 mb-4">
                Try loosening your search term or selecting another category.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-xl bg-[#0D0C0B] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
