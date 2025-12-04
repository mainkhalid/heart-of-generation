import React from 'react'

export const StatsCard = ({ title, value, change, color = 'gray' }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800',
      value: 'text-green-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-800',
      value: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-800',
      value: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-100',
      text: 'text-gray-800',
      value: 'text-gray-600'
    }
  }

  return (
    <div className={`${colorClasses[color].bg} border ${colorClasses[color].border} p-4 rounded-lg`}>
      <h3 className={`text-lg font-medium ${colorClasses[color].text}`}>
        {title}
      </h3>
      <p className={`text-3xl font-bold ${colorClasses[color].value}`}>{value}</p>
      <p className={`text-sm ${colorClasses[color].value} mt-1`}>{change}</p>
    </div>
  )
}