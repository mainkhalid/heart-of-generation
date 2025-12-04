import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventsAndFeatured() {
  // Fetch visitations from Convex
  const visitationsResponse = useQuery(api.visitations.getVisitations);
  const visitations = visitationsResponse?.data || [];

  // Filter upcoming and past events
  const now = new Date();
  const upcomingEvents = visitations
    .filter(v => new Date(v.visitDate) >= now && v.status !== 'cancelled')
    .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
    .slice(0, 3);

  // Get featured cause (event with highest budget or most recent)
  const featuredCause = upcomingEvents.length > 0 
    ? upcomingEvents.reduce((max, event) => 
        event.budget > max.budget ? event : max, upcomingEvents[0]
      )
    : null;

  // Calculate progress percentage for featured cause
  const calculateProgress = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!visitationsResponse) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Upcoming Events */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Upcoming Events</h2>
              <div className="w-16 h-1 bg-red-500"></div>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No upcoming events scheduled at the moment.</p>
                <p className="text-sm text-gray-500 mt-2">Check back soon for new visitation events!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <Link 
                    key={event._id} 
                    to={`/user/events/${event._id}`}
                    className="flex gap-4 group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Event Image */}
                    <div className="flex-shrink-0 w-28 h-28 overflow-hidden rounded bg-orange-100">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0].url}
                          alt={event.homeName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="text-red-400" size={40} />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-500 transition-colors">
                        Visitation to {event.homeName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(event.visitDate)}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">{event.status}</span>
                        <span>•</span>
                        <span>{event.numberOfChildren} children</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed line-clamp-2">
                        {event.notes || `Join us for a meaningful visit to ${event.homeName}. We'll bring joy, supplies, and support to ${event.numberOfChildren} children.`}
                      </p>
                      <span className="inline-block text-blue-500 hover:text-blue-600 font-semibold text-sm transition-colors">
                        Read More →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <div className="mt-8 text-center">
                <Link 
                  to="/user/events" 
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
                >
                  View All Events
                </Link>
              </div>
            )}
          </div>

          {/* Featured Cause */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Featured Cause</h2>
              <div className="w-16 h-1 bg-red-500"></div>
            </div>

            {!featuredCause ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No featured cause available.</p>
                <p className="text-sm text-gray-500 mt-2">We'll feature our next major event here soon!</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Featured Image */}
                <div className="h-64 overflow-hidden bg-orange-100">
                  {featuredCause.images && featuredCause.images.length > 0 ? (
                    <img
                      src={featuredCause.images[0].url}
                      alt={featuredCause.homeName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="text-red-400" size={80} />
                    </div>
                  )}
                </div>

                {/* Featured Content */}
                <div className="p-8">
                  <div className="inline-block bg-orange-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    FEATURED EVENT
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Visitation to {featuredCause.homeName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(featuredCause.visitDate)}</span>
                    </div>
                    <span>•</span>
                    <span>{featuredCause.numberOfChildren} Children</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {featuredCause.notes || `Join us for a meaningful visit to ${featuredCause.homeName}. We'll bring joy, supplies, and support to ${featuredCause.numberOfChildren} children. Your contribution will help us provide transportation, food, supplies, and gifts.`}
                  </p>

                  {/* Budget Breakdown */}
                  {featuredCause.budgetBreakdown && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">Budget Allocation:</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(featuredCause.budgetBreakdown)
                          .filter(([_, value]) => value > 0)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="font-medium text-gray-800">{formatCurrency(value)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Donate Button */}
                  <Link 
                    to={`/user/donate?event=${featuredCause._id}`}
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 mb-6 text-center"
                  >
                    Support This Cause
                  </Link>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-visible">
                      <div
                        className="absolute h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(featuredCause.budget * 0.4, featuredCause.budget)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                        style={{ left: `${calculateProgress(featuredCause.budget * 0.4, featuredCause.budget)}%` }}
                      >
                        {calculateProgress(featuredCause.budget * 0.4, featuredCause.budget)}%
                      </div>
                    </div>
                  </div>

                  {/* Funding Info */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Raised: <span className="font-semibold text-gray-800">{formatCurrency(featuredCause.budget * 0.4)}</span>
                    </span>
                    <span className="text-gray-600">
                      Goal: <span className="font-semibold text-gray-800">{formatCurrency(featuredCause.budget)}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}