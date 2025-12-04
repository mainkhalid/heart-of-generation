import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import HeroSection from "../components/HeroSection";
import { ImpactSection } from "../components/ImpactSection";
import VideoBanner from "../components/VideoBanner";
import OurCauses from "../components/CausesSection";

export const Home = () => {
 const newsResponse = useQuery(api.news.getNews);
 const news = newsResponse?.data ?? [];

  return (
    <div>
      {/* Main sections */}
      <HeroSection />
      <ImpactSection />
      <VideoBanner />
      <OurCauses />

      {/* 📰 News Widget */}
      {news.length > 0 && (
        <div className="fixed bottom-4 left-4 w-80 z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-gray-200 p-3">
          <h3 className="font-semibold text-gray-800 mb-2">Latest News</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {news.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="border-b border-gray-100 pb-1 mb-1"
              >
                <p className="text-sm font-medium text-gray-800">
                  {item.title}
                </p>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
