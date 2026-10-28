import { useState } from "react";
import { Bell, Clock, Check } from "lucide-react";
import ProductCard from "./ProductCard";

const UPCOMING_DROPS = [
  {
    _id: "restock-nomad-briefcase",
    name: "Nomad All-Leather Executive Briefcase",
    category: "accessories",
    price: 38000,
    discountPrice: 32999,
    rating: 5.0,
    reviewCount: 47,
    stock: 5,
    colors: [
      {
        name: "Espresso",
        hex: "#2B1D12",
        images: [
          "https://www.waldorleather.com/cdn/shop/products/custom_resized_efd69711-4b84-4a7b-a5ff-314f12042e6b.jpg?v=1769556766&width=990",
        ],
      },
      { name: "Obsidian", hex: "#101010" },
      { name: "Cognac Tan", hex: "#9B5A2B" },
    ],
  },
  {
    _id: "restock-weekender-bag",
    name: "The Weekender 48-Hour Leather Holdall",
    category: "accessories",
    price: 44000,
    discountPrice: 38999,
    rating: 5.0,
    reviewCount: 39,
    stock: 4,
    colors: [
      {
        name: "Saddle Tan",
        hex: "#9B5A2B",
        images: [
          "https://www.waldorleather.com/cdn/shop/products/8_9be8830e-3b68-4ddf-9631-be2ac9040522.jpg?v=1683289272&width=990",
        ],
      },
      { name: "Espresso", hex: "#2B1D12" },
      { name: "Midnight Black", hex: "#101010" },
    ],
  },
];

export const RestockShowcase = () => {
  const [notified, setNotified] = useState({});

  const handleNotify = (id) => {
    setNotified((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F5]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {UPCOMING_DROPS.map((product) => (
            <div key={product._id} className="flex flex-col">
              <ProductCard product={product} loading={false} />
              <div className="mt-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5 text-xs text-[#8C867C]">
                  <Clock className="w-3.5 h-3.5 text-[#9B5A2B]" />
                  <span>Batch Restock: Next Week</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotify(product._id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    notified[product._id]
                      ? "bg-[#EFECE5] text-[#9B5A2B] border-[#DDD5C5]"
                      : "bg-white text-[#0D0C0B] border-[#E8E2D6] hover:bg-[#0D0C0B] hover:text-white"
                  }`}
                >
                  {notified[product._id] ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3 h-3" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestockShowcase;
