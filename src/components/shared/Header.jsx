import React from 'react';

 export const Header = ({ 
  title = "About Us", 
  subtitle = "",
  backgroundImage = "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&h=400&fit=crop",
  overlayOpacity = "bg-opacity-60",
  textColor = "text-white",
  accentColor = "bg-red-500",
  height = "h-90"
}) => {
  return (
    <div className={`relative ${height} w-full overflow-hidden`}>
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
     
      <div className={`absolute inset-0 bg-black ${overlayOpacity}`} />
      
      
      <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
        <div>
          <h1 className={`text-4xl md:text-5xl font-bold ${textColor} mb-2`}>
            {title}
          </h1>
          <div className={`w-16 h-1 ${accentColor}`} />
          {subtitle && (
            <p className={`mt-4 text-lg ${textColor} opacity-90`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};