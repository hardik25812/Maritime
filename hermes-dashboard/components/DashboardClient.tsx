'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { dailyBrief, agents, weeklyTrends } from '@/lib/mock-data'
import { formatCurrency, formatNumber, timeAgo, getSeverityColor, cn } from '@/lib/utils'
import {
  DollarSign, ShoppingCart, Star, Search, AlertTriangle,
  TrendingUp, Package, Mail, Shield, Eye
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar
} from 'recharts'

export default function DashboardClient() {
  const b = dailyBrief
  const activeAlerts = b.alerts.filter(a => !a.acknowledged)
  const spamRemaining = b.seo.spamPagesFound - b.seo.spamPagesRemoved

  return (
    <div>
      <TopBar title="Morning Brief" subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Art Needlepoint Company`} />

      <div className="p-6 space-y-6">
        {/* Critical Alerts Banner */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border', getSeverityColor(alert.severity), alert.severity === 'critical' && 'security-alert')}>
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs mt-1 opacity-70">{alert.agent} · {timeAgo(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Row */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign size={14} /> Revenue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Revenue Today" value={formatCurrency(b.revenue.revenueToday)} subtitle={`${b.revenue.ordersToday} orders`} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <StatCard title="Revenue This Week" value={formatCurrency(b.revenue.revenueThisWeek)} subtitle={`${b.revenue.ordersThisWeek} orders`} icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard title="Revenue MTD" value={formatCurrency(b.revenue.revenueMTD)} subtitle={`${b.revenue.ordersMTD} orders · $57.6K target`} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" trend={{ value: 12, label: 'vs last month' }} />
            <StatCard title="AOV" value={formatCurrency(b.revenue.aov)} subtitle="Average order value" icon={ShoppingCart} iconColor="text-amber-600" iconBg="bg-amber-50" />
          </div>
        </div>

        {/* SEO + Reviews Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEO */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Search size={14} /> SEO Health
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{b.seo.indexedPages}</p>
                  <p className="text-xs text-gray-500">Indexed Pages</p>
                  <p className="text-[10px] text-gray-400">Target: {formatNumber(b.seo.indexedTarget)}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">{spamRemaining}</p>
                  <p className="text-xs text-gray-500">Spam Remaining</p>
                  <p className="text-[10px] text-gray-400">{b.seo.spamPagesRemoved} removed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">#{b.seo.topKeywords[0]?.position}</p>
                  <p className="text-xs text-gray-500">&quot;needlepoint kits&quot;</p>
                  <p className="text-[10px] text-gray-400">Target: #3-4</p>
                </div>
              </div>
              <div className="space-y-2">
                {b.seo.topKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{kw.keyword}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">#{kw.position}</span>
                      <span className={cn('text-xs font-medium', kw.change > 0 ? 'text-emerald-600' : kw.change < 0 ? 'text-red-600' : 'text-gray-400')}>
                        {kw.change > 0 ? `↑${kw.change}` : kw.change < 0 ? `↓${Math.abs(kw.change)}` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews + Recovery */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Star size={14} /> Reviews & Recovery
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Google Reviews" value={b.reviews.totalReviews} subtitle={`${b.reviews.avgRating} avg · Target: ${b.reviews.reviewTarget}`} icon={Star} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
              <StatCard title="Pending Approval" value={b.reviews.pendingRequests} subtitle="Awaiting Doreen" icon={Eye} iconColor="text-purple-600" iconBg="bg-purple-50" />
              <StatCard title="Carts Recovered" value={`${b.recovery.recoveredCarts}/${b.recovery.abandonedCarts}`} subtitle={formatCurrency(b.recovery.recoveredRevenue) + ' recovered'} icon={ShoppingCart} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
              <StatCard title="Recovery Emails" value={b.recovery.emailsSent} subtitle={`${b.recovery.failedPayments} failed payments`} icon={Mail} iconColor="text-blue-600" iconBg="bg-blue-50" />
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Weekly Revenue Trend</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c5f2e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2c5f2e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#2c5f2e" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Index Coverage Crisis Chart */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> Index Coverage Crisis
          </h2>
          <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="indexedPages" fill="#dc2626" radius={[4, 4, 0, 0]} name="Indexed Pages" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-red-600 mt-2 text-center font-medium">
              From 1,847 indexed pages → 10 pages in 6 weeks. Hack + HCU impact. Recovery in progress.
            </p>
          </div>
        </div>

        {/* Agent Status Row */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield size={14} /> Agent Team Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {agents.map(agent => (
              <div key={agent.name} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{agent.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{agent.name}</span>
                  <div className={cn(
                    'w-2 h-2 rounded-full ml-auto',
                    agent.status === 'active' ? 'bg-emerald-400 agent-active' :
                    agent.status === 'alert' ? 'bg-amber-400' :
                    agent.status === 'idle' ? 'bg-gray-300' : 'bg-red-400'
                  )} />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{agent.lastAction}</p>
                <p className="text-[10px] text-gray-400 mt-1">{agent.lastActionTime}</p>
              </div>
            ))}
          </div>
        </div>

        {/* All Alerts */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Alerts</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {b.alerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 px-5 py-3">
                <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.agent} · {timeAgo(alert.timestamp)}</p>
                </div>
                <Badge status={alert.acknowledged ? 'approved' : 'detected'} label={alert.acknowledged ? 'ACK' : 'NEW'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
