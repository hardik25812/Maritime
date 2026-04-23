'use client'

import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { cartAbandonments, dailyBrief } from '@/lib/mock-data'
import { formatCurrency, timeAgo, cn } from '@/lib/utils'
import { ShoppingCart, DollarSign, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function CartsClient() {
  const b = dailyBrief.recovery
  const active = cartAbandonments.filter(c => c.status === 'active')
  const recovered = cartAbandonments.filter(c => c.status === 'recovered')
  const expired = cartAbandonments.filter(c => c.status === 'expired')

  const touchLabel = (count: number) => {
    if (count === 0) return 'Not contacted'
    if (count === 1) return 'Touch 1: Gentle reminder'
    if (count === 2) return 'Touch 2: Social proof'
    return 'Touch 3: Incentive/urgency'
  }

  return (
    <div>
      <TopBar title="Cart Abandonment" subtitle="ATLAS + ECHO agents · 3-touch recovery sequence" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Abandons" value={active.length} subtitle="In recovery sequence" icon={ShoppingCart} iconColor="text-red-600" iconBg="bg-red-50" />
          <StatCard title="Recovered Today" value={b.recoveredCarts} subtitle={formatCurrency(b.recoveredRevenue)} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <StatCard title="Recovery Emails" value={b.emailsSent} subtitle="Sent today" icon={Mail} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Potential Revenue" value={formatCurrency(active.reduce((s, c) => s + c.cartTotal, 0))} subtitle="In active carts" icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
        </div>

        {/* 3-Touch Sequence Diagram */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">3-Touch Recovery Sequence</h2>
          <div className="flex items-center gap-2">
            {[
              { time: '1 hour', label: 'Gentle Reminder', desc: '"Your [product] is waiting"', color: 'bg-blue-500', lightBg: 'bg-blue-50' },
              { time: '24 hours', label: 'Social Proof', desc: 'Finished project photos, FAQ', color: 'bg-purple-500', lightBg: 'bg-purple-50' },
              { time: '72 hours', label: 'Incentive', desc: 'BOGO (2+ items) or urgency', color: 'bg-amber-500', lightBg: 'bg-amber-50' },
            ].map((step, i) => (
              <div key={i} className="flex-1 relative">
                <div className={cn('rounded-lg p-4 border', step.lightBg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold', step.color)}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-medium text-gray-500">{step.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="absolute top-1/2 -right-3 w-4 text-center text-gray-300 text-lg z-10">→</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Checks WooCommerce after each wait. If order completed → sequence stops automatically.
          </p>
        </div>

        {/* Active Carts Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">All Cart Abandonments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase">Cart Total</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Abandoned</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Touch</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cartAbandonments.map(cart => (
                  <tr key={cart.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{cart.customerName}</p>
                      <p className="text-xs text-gray-400">{cart.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="max-w-[200px]">
                        {cart.items.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600 truncate">{item}</p>
                        ))}
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 font-mono font-bold text-gray-800">
                      {formatCurrency(cart.cartTotal)}
                    </td>
                    <td className="text-center px-3 py-3 text-xs text-gray-500">
                      {timeAgo(cart.abandonedAt)}
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3].map(t => (
                          <div
                            key={t}
                            className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                              t <= cart.touchesSent
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{touchLabel(cart.touchesSent)}</p>
                    </td>
                    <td className="text-center px-3 py-3">
                      <Badge status={cart.status} />
                      {cart.recoveredAt && (
                        <p className="text-[10px] text-emerald-500 mt-0.5">{timeAgo(cart.recoveredAt)}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOGO Rules */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">Touch 3 Logic (72 hours)</p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="text-xs text-amber-700">
              <p className="font-medium">2+ items in cart → BOGO</p>
              <p className="mt-0.5">&quot;Buy 3 kits, get the 4th free — you&apos;re already most of the way there.&quot;</p>
            </div>
            <div className="text-xs text-amber-700">
              <p className="font-medium">1 item in cart → Urgency</p>
              <p className="mt-0.5">&quot;Your [product] won&apos;t be held much longer — Doreen hand-selects every design.&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
