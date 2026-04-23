'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import { dailyBrief, weeklyTrends } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, ShoppingCart, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend
} from 'recharts'

export default function RevenueClient() {
  const b = dailyBrief
  const recoveryRate = b.recovery.abandonedCarts > 0
    ? ((b.recovery.recoveredCarts / b.recovery.abandonedCarts) * 100).toFixed(1)
    : '0'

  const funnelData = [
    { stage: 'Abandoned', value: b.recovery.abandonedCarts, fill: '#dc2626' },
    { stage: 'Email Sent', value: b.recovery.emailsSent, fill: '#d97706' },
    { stage: 'Recovered', value: b.recovery.recoveredCarts, fill: '#059669' },
  ]

  return (
    <div>
      <TopBar title="Revenue Recovery" subtitle="ATLAS agent · Cart abandonment & payment recovery" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Revenue MTD" value={formatCurrency(b.revenue.revenueMTD)} subtitle={`${b.revenue.ordersMTD} orders`} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" trend={{ value: 12, label: 'vs last month' }} />
          <StatCard title="Recovered Revenue" value={formatCurrency(b.recovery.recoveredRevenue)} subtitle={`${b.recovery.recoveredCarts} carts recovered today`} icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Recovery Rate" value={`${recoveryRate}%`} subtitle={`${b.recovery.recoveredCarts} of ${b.recovery.abandonedCarts} carts`} icon={ShoppingCart} iconColor="text-purple-600" iconBg="bg-purple-50" />
          <StatCard title="Failed Payments" value={b.recovery.failedPayments} subtitle={`${b.recovery.recoveredPayments} recovered`} icon={CreditCard} iconColor="text-red-600" iconBg="bg-red-50" />
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyTrends}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2c5f2e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2c5f2e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#2c5f2e" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recovery Funnel + Cart Recovery Trend side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recovery Funnel */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recovery Funnel (Today)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={90} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Count">
                  {funnelData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Cart Recovery */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Cart Recoveries</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="recoveredCarts" fill="#059669" radius={[4, 4, 0, 0]} name="Recovered Carts" />
                <Bar dataKey="orders" fill="#2c5f2e" radius={[4, 4, 0, 0]} name="Total Orders" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Opportunity Calculator */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600" /> Revenue Opportunity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-xs font-medium text-emerald-600 uppercase">Current Monthly</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{formatCurrency(57600)}</p>
              <p className="text-xs text-emerald-600 mt-1">$180 AOV × 320 orders</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 uppercase">With Recovery (Est.)</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{formatCurrency(64800)}</p>
              <p className="text-xs text-blue-600 mt-1">+{formatCurrency(7200)}/mo from cart recovery</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-xs font-medium text-purple-600 uppercase">With SEO Restored (Est.)</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">{formatCurrency(86400)}</p>
              <p className="text-xs text-purple-600 mt-1">+50% organic traffic at position #3-4</p>
            </div>
          </div>
        </div>

        {/* Payment Recovery Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CreditCard size={16} /> Payment Recovery Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Failed payment — Order #4891 ($312)</p>
                <p className="text-xs text-red-600">Card declined · Recovery email sent 45 min ago</p>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Pending</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle size={16} className="text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Recovered — Order #4887 ($198)</p>
                <p className="text-xs text-emerald-600">Customer updated card after recovery email</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Recovered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
