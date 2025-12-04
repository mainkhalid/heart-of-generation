import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function OurCauses() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  
  const causesData = useQuery(api.causes.getActiveCauses);
  
  if (causesData === undefined) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </section>
    );
  }

  const causes = causesData?.data || [];


  if (causes.length === 0) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Our Causes</h2>
            <div className="w-16 h-1 bg-blue-500"></div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No active causes at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  const cardsPerView = 3;
  const maxIndex = Math.max(0, causes.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

 
  const getCausePercentage = (currentAmount, goalAmount) => {
    if (goalAmount === 0) return 0;
    return Math.min(Math.round((currentAmount / goalAmount) * 100), 100);
  };

  
  const getCauseImage = (cause) => {
    if (cause.images && cause.images.length > 0) {
      return cause.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80';
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          opacity: 0.3
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Our Causes</h2>
          <div className="w-16 h-1 bg-red-500"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Previous Button */}
          {causes.length > cardsPerView && (
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-14 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-300"
              aria-label="Previous"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
            >
              {causes.map((cause) => {
                const percentage = getCausePercentage(cause.currentAmount, cause.goalAmount);
                const image = getCauseImage(cause);
                
                return (
                  <div
                    key={cause._id}
                    className="w-full md:w-1/3 flex-shrink-0 px-3"
                  >
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {/* Image */}
                      <div className="h-56 overflow-hidden">
                        <img
                          src={image}
                          alt={cause.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {cause.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                          {cause.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-visible">
                            <div
                              className="absolute h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                            <div
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                              style={{ left: `${percentage}%` }}
                            >
                              {percentage}%
                            </div>
                          </div>
                        </div>

                        {/* Funding Info */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Raised: <span className="font-semibold text-gray-800">${(cause.currentAmount || 0).toLocaleString()}</span>
                          </span>
                          <span className="text-gray-600">
                            Goal: <span className="font-semibold text-gray-800">${cause.goalAmount.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          {causes.length > cardsPerView && (
            <button
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-14 h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-300"
              aria-label="Next"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}