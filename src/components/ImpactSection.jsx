import React from 'react'

export const ImpactSection = () => {
  return (
    <section className="py-16 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Our Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With your support, we've been able to make a significant
            difference in many children's lives.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatCard value="200+" label="Children Supported" />
          <StatCard value="85%" label="School Completion Rate" />
          <StatCard value="12" label="Years of Operation" />
          <StatCard value="100+" label="University Graduates" />
        </div>
      </div>
    </section>
  )
}

const StatCard = ({ value, label }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-4xl font-bold text-blue-600 mb-2">{value}</p>
      <p className="text-gray-700 font-medium">{label}</p>
    </div>
  )
}