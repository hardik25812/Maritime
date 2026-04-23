'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { seoKeywords, indexCoverageHistory, spamPages } from '@/lib/mock-data'
import { formatNumber, getPositionChangeIcon, getPositionChangeColor, cn } from '@/lib/utils'
import { Search, Globe, AlertTriangle, TrendingUp, Shield, Eye } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line, ComposedChart, Bar
} from 'recharts'

export default function SEOClient() {
  const latestCoverage = indexCoverageHistory[indexCoverageHistory.length - 1]
  const spamRemaining = spamPages.filter(p => p.status === 'detected').length
  const spamRemoved = spamPages.filter(p => p.status === 'removed').length
  const improvingKw = seoKeywords.filter(k => k.change > 0).length

  return (
    <div>
      <TopBar title="SEO Report" subtitle="SCOUT agent · Daily ranking & index monitoring" />

      <div className="p-6 space-y-6">
        {/* Spam Alert */}
        {spamRemaining > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3 security-alert">
            <AlertTriangle size={20} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">🚨 {spamRemaining} new spam pages detected (author: andevtemp)</p>
              <p className="text-xs text-red-600 mt-1">Immediate removal required. {261 + spamRemoved} of 279 total spam pages already cleaned.</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Indexed Pages" value={latestCoverage.indexed} subtitle={`Target: ${formatNumber(latestCoverage.submitted)}`} icon={Globe} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard title="Spam Cleaned" value={`${261 + spamRemoved}/279`} subtitle={`${spamRemaining} remaining`} icon={Shield} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <StatCard title="Keywords Improving" value={`${improvingKw}/${seoKeywords.length}`} subtitle="Week over week" icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Target Position" value="#3-4" subtitle='"needlepoint kits" · currently #14' icon={Search} iconColor="text-purple-600" iconBg="bg-purple-50" />
        </div>

        {/* Index Coverage Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Eye size={16} /> Index Coverage Over Time
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={indexCoverageHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => new Date(String(v)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip labelFormatter={(v) => new Date(String(v)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              <Area type="monotone" dataKey="indexed" stroke="#2c5f2e" fill="#2c5f2e" fillOpacity={0.15} strokeWidth={2} name="Indexed" />
              <Bar dataKey="error" fill="#dc2626" opacity={0.3} name="Errors" />
              <Line type="monotone" dataKey="excluded" stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Excluded" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2 text-center">Hack discovered March 2026. Casino spam injection caused mass de-indexing.</p>
        </div>

        {/* Keyword Rankings Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Keyword Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Keyword</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {seoKeywords.map((kw, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">{kw.keyword}</td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono font-bold text-gray-900">#{kw.currentPosition}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn('font-medium', getPositionChangeColor(kw.change))}>
                        {getPositionChangeIcon(kw.change)} {kw.change !== 0 && Math.abs(kw.change)}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 text-gray-600">{formatNumber(kw.searchVolume)}</td>
                    <td className="px-3 py-3 text-gray-500 font-mono text-xs">{kw.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spam Pages */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Spam Pages Log (Latest)
            </h2>
            <span className="text-xs text-gray-400">279 total detected · {261 + spamRemoved} removed</span>
          </div>
          <div className="divide-y divide-gray-50">
            {spamPages.map(page => (
              <div key={page.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
                <Badge status={page.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{page.title}</p>
                  <p className="text-xs text-gray-400 font-mono">{page.url}</p>
                </div>
                <span className="text-xs text-red-500 font-medium">{page.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
