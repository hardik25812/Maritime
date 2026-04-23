'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { milestoneCheckIns } from '@/lib/mock-data'
import { getCategoryTimeline, cn } from '@/lib/utils'
import { Clock, Heart, AlertCircle, Camera, MessageSquare, Package } from 'lucide-react'

export default function MilestonesClient() {
  const positive = milestoneCheckIns.filter(m => m.status === 'positive')
  const stuck = milestoneCheckIns.filter(m => m.status === 'stuck')
  const finished = milestoneCheckIns.filter(m => m.status === 'finished')
  const scheduled = milestoneCheckIns.filter(m => m.status === 'scheduled')
  const noResponse = milestoneCheckIns.filter(m => m.status === 'no_response')

  const routeIcon = (route?: string) => {
    switch (route) {
      case 'review_queue': return <span className="text-yellow-500" title="Queued for review request">⭐</span>
      case 'doreen_support': return <span className="text-orange-500" title="Routed to Doreen for help">🆘</span>
      case 'strut_your_stitches': return <span className="text-purple-500" title="Strut Your Stitches photo">📸</span>
      default: return null
    }
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'small': return 'bg-blue-100 text-blue-700'
      case 'medium': return 'bg-purple-100 text-purple-700'
      case 'large': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <TopBar title="Product Milestone Agent" subtitle="Breakthrough 3: Silent Majority Activator — product-aware check-ins" />

      <div className="p-6 space-y-6">
        {/* Concept Banner */}
        <div className="bg-gradient-to-r from-[#2c5f2e] to-[#3a7d3d] rounded-xl p-5 text-white">
          <h2 className="text-lg font-bold mb-2">🧵 The Silent Majority Activator</h2>
          <p className="text-sm opacity-90 leading-relaxed">
            320 orders/month — most customers buy, receive their kit, and disappear into silence for months while they stitch.
            This agent checks in based on <strong>product size and complexity</strong>, not a generic timer.
            Ornaments: 3 weeks. Medium kits: 8 weeks. Large masterpieces: 16 weeks.
          </p>
          <p className="text-xs opacity-70 mt-2 italic">&quot;It can take somebody six months to finish some of these things.&quot; — Doreen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Scheduled" value={scheduled.length} icon={Clock} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Positive" value={positive.length} subtitle="→ Review queue" icon={Heart} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <StatCard title="Stuck" value={stuck.length} subtitle="→ Doreen support" icon={AlertCircle} iconColor="text-orange-600" iconBg="bg-orange-50" />
          <StatCard title="Finished" value={finished.length} subtitle="→ Strut Your Stitches" icon={Camera} iconColor="text-purple-600" iconBg="bg-purple-50" />
          <StatCard title="No Response" value={noResponse.length} subtitle="Recheck at 2× timeline" icon={MessageSquare} iconColor="text-gray-500" iconBg="bg-gray-50" />
        </div>

        {/* Timeline Rules */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Package size={16} /> Product-Aware Timeline Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-600 uppercase">Small Projects</p>
              <p className="text-sm text-blue-800 mt-1">Ornaments, coasters, small accessories</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">3 weeks</p>
              <p className="text-xs text-blue-500 mt-1">Recheck: 6 weeks if no response</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 uppercase">Medium Kits ($100-200)</p>
              <p className="text-sm text-purple-800 mt-1">Pillows, belts, eyeglass cases</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">8 weeks</p>
              <p className="text-xs text-purple-500 mt-1">Recheck: 16 weeks if no response</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p className="text-xs font-medium text-amber-600 uppercase">Large Masterpieces ($200+)</p>
              <p className="text-sm text-amber-800 mt-1">Rugs, landscapes, large panels</p>
              <p className="text-2xl font-bold text-amber-700 mt-2">16 weeks</p>
              <p className="text-xs text-amber-500 mt-1">Recheck: 32 weeks if no response</p>
            </div>
          </div>
        </div>

        {/* Milestone Check-ins Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">All Milestone Check-ins</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Timeline</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {milestoneCheckIns.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{m.customerName}</p>
                      <p className="text-xs text-gray-400">{m.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[220px]">
                      <p className="truncate">{m.product}</p>
                      {m.response && (
                        <p className="text-xs text-gray-400 mt-1 italic truncate">&quot;{m.response}&quot;</p>
                      )}
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', categoryColor(m.productCategory))}>
                        {m.productCategory}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 text-xs text-gray-500">{getCategoryTimeline(m.productCategory)}</td>
                    <td className="text-center px-3 py-3 text-xs text-gray-500">{m.checkInDate}</td>
                    <td className="text-center px-3 py-3"><Badge status={m.status} /></td>
                    <td className="text-center px-3 py-3">{routeIcon(m.routedTo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Response Routing Diagram */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Response Routing Logic</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs leading-loose text-gray-600">
            <p>WooCommerce order completed → look up product category + size</p>
            <p className="pl-4">→ Set milestone timeline (3 / 8 / 16 weeks)</p>
            <p className="pl-4">→ Send: &quot;Hi [Name], how&apos;s your [specific product] coming along?&quot;</p>
            <p className="pl-8">├── ✅ <span className="text-emerald-600">Positive response</span> → queue for review ask (IRIS)</p>
            <p className="pl-8">├── 🆘 <span className="text-orange-600">&quot;I&apos;m stuck&quot;</span> → route to Doreen for personal help</p>
            <p className="pl-8">├── 📸 <span className="text-purple-600">&quot;I finished!&quot;</span> → ask for photo (Strut Your Stitches) + Google review</p>
            <p className="pl-8">└── 🔇 <span className="text-gray-500">No response</span> → soft re-check at 2× original timeline</p>
          </div>
        </div>
      </div>
    </div>
  )
}
