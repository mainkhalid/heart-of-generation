import React from 'react'
import { StatsCard } from "../components/StatsCard"
import  { RecentDonationsTable}  from "../components/RecentDonationsTable"

export const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Donations" 
          value="KES 245,780" 
          change="+12% from last month" 
          color="green" 
        />
        <StatsCard 
          title="Children Supported" 
          value="127" 
          change="+5 new this month" 
          color="blue" 
        />
        <StatsCard 
          title="Active Donors" 
          value="89" 
          change="+8% from last month" 
          color="purple" 
        />
      </div>
      <RecentDonationsTable />
    </div>
  )
}