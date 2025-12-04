import React, { useState } from 'react';
import { MoreHorizontal, Download, Loader, Image } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function GalleryPage() {
  const [hoveredId, setHoveredId] = useState(null);

  const images = useQuery(api.gallery.getGalleryImages);

  if (images === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Image className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">No Images Yet</h2>
          <p className="text-gray-400">The gallery is empty. Check back soon!</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (url, publicId) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${publicId || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Gallery</h1>
          <p className="text-gray-400">Moments captured, memories shared</p>
          <div className="mt-2 text-sm text-gray-500">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image) => (
            <div
              key={image._id}
              className="relative break-inside-avoid group cursor-pointer"
              onMouseEnter={() => setHoveredId(image._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={image.url}
                  alt={`Gallery image ${image.publicId}`}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
                  hoveredId === image._id ? 'opacity-100' : 'opacity-0'
                }`}>
                  {/* Top right menu */}
                  <button 
                    className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add menu functionality here
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-800" />
                  </button>
                  
                  {/* Bottom right save button */}
                  <button 
                    className="absolute bottom-3 right-3 bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add save functionality here
                      window.open(image.url, '_blank');
                    }}
                  >
                    View
                  </button>
                  
                  {/* Bottom left download */}
                  <button 
                    className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image.url, image.publicId);
                    }}
                  >
                    <Download className="w-4 h-4 text-gray-800" />
                  </button>
                </div>
              </div>
              
              {/* Timestamp below image */}
              <div className="mt-2 px-2">
                <p className="text-gray-400 text-xs">
                  {new Date(image.uploadedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}