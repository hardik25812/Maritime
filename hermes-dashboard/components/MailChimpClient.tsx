'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import { mailchimpAttribution } from '@/lib/mock-data'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Mail, DollarSign, Eye, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts'

export default function MailChimpClient() {
  const latest = mailchimpAttribution[mailchimpAttribution.length - 1]
  const totalAttributed = mailchimpAttribution.reduce((sum, w) => sum + w.attributedRevenue, 0)
  const totalOrders = mailchimpAttribution.reduce((sum, w) => sum + w.ordersWithin48h, 0)
  const avgOpenRate = mailchimpAttribution.reduce((sum, w) => sum + w.openRate, 0) / mailchimpAttribution.length

  return (
    <div>
      <TopBar title="MailChimp Attribution" subtitle="Breakthrough 4: Proving newsletter ROI with cross-referenced revenue" />

      <div className="p-6 space-y-6">
        {/* Concept Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 text-white">
          <h2 className="text-lg font-bold mb-2">📧 The MailChimp Revenue Fix</h2>
          <p className="text-sm opacity-90 leading-relaxed">
            &quot;None of the revenue is accurate. Never has been. Because they&apos;re looking for them to click off the newsletter.
            They don&apos;t always do that. They just come to the site.&quot;
          </p>
          <p className="text-xs opacity-70 mt-2">
            This dashboard cross-references MailChimp &quot;opened&quot; timestamps with WooCommerce orders placed within 48 hours
            by the same email address — showing the <strong>true revenue</strong> driven by Mondays with Needlepoint.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="This Week's Revenue" value={formatCurrency(latest.attributedRevenue)} subtitle={`${latest.ordersWithin48h} orders within 48hr`} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <StatCard title="7-Week Total" value={formatCurrency(totalAttributed)} subtitle={`${totalOrders} attributed orders`} icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Avg Open Rate" value={formatPercent(avgOpenRate)} subtitle="25K subscribers" icon={Eye} iconColor="text-purple-600" iconBg="bg-purple-50" />
          <StatCard title="This Week Orders" value={latest.ordersWithin48h} subtitle="Within 48hrs of open" icon={ShoppingCart} iconColor="text-amber-600" iconBg="bg-amber-50" />
        </div>

        {/* Revenue Attribution Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Weekly Attributed Revenue (Open → Order within 48hrs)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={mailchimpAttribution}>
              <defs>
                <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af"
                tickFormatter={(v) => new Date(String(v)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} stroke="#9ca3af"
                tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                labelFormatter={(v) => `Week of ${new Date(String(v)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
              />
              <Legend />
              <Area yAxisId="revenue" type="monotone" dataKey="attributedRevenue" stroke="#2563eb" fill="url(#mcGrad)" strokeWidth={2} name="Attributed Revenue ($)" />
              <Bar yAxisId="orders" dataKey="ordersWithin48h" fill="#059669" radius={[4, 4, 0, 0]} opacity={0.7} name="Orders (48hr window)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Open Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Mail size={16} /> Open Rate Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mailchimpAttribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af"
                tickFormatter={(v) => new Date(String(v)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[35, 50]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <Line type="monotone" dataKey="openRate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Open Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Weekly Attribution Data</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Week</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Opened</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Orders (48hr)</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Attributed Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mailchimpAttribution.map((w, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-center px-3 py-3 text-gray-600">{w.emailsSent.toLocaleString()}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{w.emailsOpened.toLocaleString()}</td>
                    <td className="text-center px-3 py-3 text-purple-600 font-medium">{w.openRate}%</td>
                    <td className="text-center px-3 py-3 text-emerald-600 font-bold">{w.ordersWithin48h}</td>
                    <td className="text-right px-5 py-3 text-blue-700 font-bold">{formatCurrency(w.attributedRevenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="px-5 py-3 text-gray-700">Total (7 weeks)</td>
                  <td className="text-center px-3 py-3 text-gray-600">—</td>
                  <td className="text-center px-3 py-3 text-gray-600">—</td>
                  <td className="text-center px-3 py-3 text-purple-600">{formatPercent(avgOpenRate)} avg</td>
                  <td className="text-center px-3 py-3 text-emerald-600">{totalOrders}</td>
                  <td className="text-right px-5 py-3 text-blue-700">{formatCurrency(totalAttributed)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Fix Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">How This Attribution Works</h3>
          <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
            <li>UTM parameters added to every link in &quot;Mondays with Needlepoint&quot;</li>
            <li>WooCommerce + Google Analytics attribution window configured</li>
            <li>Cross-reference: MailChimp &quot;opened&quot; timestamps ↔ WooCommerce orders within 48 hours by same email</li>
            <li>Dashboard shows: customers who opened Monday&apos;s email AND placed an order = attributed revenue</li>
          </ol>
          <p className="text-xs text-blue-600 mt-3 italic">
            This proves what the newsletter is truly worth — even when customers don&apos;t click the link directly.
          </p>
        </div>
      </div>
    </div>
  )
}
