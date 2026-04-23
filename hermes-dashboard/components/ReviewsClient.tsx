'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { reviewRequests, dailyBrief } from '@/lib/mock-data'
import { getSentimentColor, cn } from '@/lib/utils'
import { Star, Clock, CheckCircle, XCircle, Eye, Send, UserCheck } from 'lucide-react'

export default function ReviewsClient() {
  const b = dailyBrief.reviews
  const awaiting = reviewRequests.filter(r => r.status === 'awaiting_doreen')
  const sent = reviewRequests.filter(r => r.status === 'sent')
  const reviewed = reviewRequests.filter(r => r.status === 'reviewed')
  const scheduled = reviewRequests.filter(r => r.status === 'scheduled')

  return (
    <div>
      <TopBar title="Review Pipeline" subtitle="IRIS agent · Sentiment routing & Google review collection" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Google Reviews" value={b.totalReviews} subtitle={`${b.avgRating} avg · Target: ${b.reviewTarget}`} icon={Star} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
          <StatCard title="Awaiting Doreen" value={awaiting.length} subtitle="Review email drafts pending" icon={Eye} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <StatCard title="Sent This Week" value={sent.length} subtitle="Review requests delivered" icon={Send} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Reviews Posted" value={reviewed.length} subtitle="Customers who left reviews" icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        </div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Review Pipeline Progress</h2>
          <div className="flex items-center gap-2">
            {[
              { label: 'Scheduled', count: scheduled.length, color: 'bg-blue-500' },
              { label: 'Awaiting Doreen', count: awaiting.length, color: 'bg-amber-500' },
              { label: 'Sent', count: sent.length, color: 'bg-purple-500' },
              { label: 'Reviewed', count: reviewed.length, color: 'bg-emerald-500' },
            ].map((stage, i) => (
              <div key={i} className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                  <span className="text-xs text-gray-500">{stage.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stage.count}</div>
              </div>
            ))}
          </div>
          <div className="flex mt-3 rounded-full overflow-hidden h-2 bg-gray-100">
            <div className="bg-blue-500 transition-all" style={{ width: `${(scheduled.length / reviewRequests.length) * 100}%` }} />
            <div className="bg-amber-500 transition-all" style={{ width: `${(awaiting.length / reviewRequests.length) * 100}%` }} />
            <div className="bg-purple-500 transition-all" style={{ width: `${(sent.length / reviewRequests.length) * 100}%` }} />
            <div className="bg-emerald-500 transition-all" style={{ width: `${(reviewed.length / reviewRequests.length) * 100}%` }} />
          </div>
        </div>

        {/* Review Requests Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">All Review Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Sentiment</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Send Date</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviewRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{req.customerName}</p>
                      <p className="text-xs text-gray-400">{req.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">{req.product}</td>
                    <td className="text-center px-3 py-3">
                      {req.sentiment ? (
                        <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', getSentimentColor(req.sentiment))}>
                          {req.sentiment}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3">
                      {req.sentimentScore ? (
                        <span className={cn('font-mono font-bold', req.sentimentScore >= 8 ? 'text-emerald-600' : req.sentimentScore >= 5 ? 'text-amber-600' : 'text-red-600')}>
                          {req.sentimentScore}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3 text-xs text-gray-500">{req.scheduledSendDate}</td>
                    <td className="text-center px-3 py-3">
                      <Badge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
            <Clock size={16} /> Review Request Timing Rules
          </p>
          <ul className="text-xs text-amber-700 mt-2 space-y-1">
            <li>• Review requests sent <strong>7 days after delivery</strong> — never sooner</li>
            <li>• Only customers with sentiment score <strong>≥ 8</strong> receive review requests</li>
            <li>• All drafts require <strong>Doreen&apos;s approval</strong> before sending</li>
            <li>• Unhappy customers (score &lt; 8) routed to Doreen privately — never asked for public review</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
