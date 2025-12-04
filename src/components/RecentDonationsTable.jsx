import React, { useState, useEffect } from 'react'
import axios from 'axios'

export const RecentDonationsTable = ({ limit = 5 }) => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch recent donations from API
  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        setLoading(true)
        
        // Only get completed donations, sort by most recent, limit results
        const params = new URLSearchParams()
        params.append('status', 'completed')
        params.append('limit', limit)
        params.append('page', 1)
        
        const response = await axios.get(`/api/donations?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        setDonations(response.data.data.donations)
        setError(null)
      } catch (err) {
        console.error('Error fetching recent donations:', err)
        setError('Failed to load recent donations')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentDonations()
  }, [limit])

  // Format date from ISO to readable format
  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A'
    return new Date(isoDate).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Donations</h3>
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading recent donations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Donations</h3>
        <div className="bg-red-50 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    )
  }

  if (donations.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Donations</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No donations found
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Recent Donations</h3>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(donation.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {donation.donor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(donation.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}