'use client'

import TopBar from '@/components/TopBar'
import Badge from '@/components/Badge'
import { contentDrafts } from '@/lib/mock-data'
import { timeAgo, cn } from '@/lib/utils'
import { FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useState } from 'react'

export default function ContentClient() {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? contentDrafts
    : contentDrafts.filter(d => d.status === filter)

  const pending = contentDrafts.filter(d => d.status === 'pending_doreen')
  const approved = contentDrafts.filter(d => d.status === 'approved')
  const rejected = contentDrafts.filter(d => d.status === 'rejected')

  const typeIcon = (type: string) => {
    switch (type) {
      case 'email_draft': return '📧'
      case 'category_page': return '📄'
      case 'meta_description': return '🏷️'
      case 'title_tag': return '🔤'
      case 'review_response': return '💬'
      default: return '📝'
    }
  }

  const typeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <div>
      <TopBar title="Content Queue" subtitle="Doreen's approval queue — all customer-facing copy reviewed before publishing" />

      <div className="p-6 space-y-6">
        {/* Doreen Approval Banner */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <Eye size={20} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {pending.length} item{pending.length !== 1 ? 's' : ''} awaiting Doreen&apos;s review
              </p>
              <p className="text-xs text-amber-600 mt-1">
                &quot;I need to see the writing&quot; — All customer-facing copy requires Doreen&apos;s approval before send/publish.
              </p>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              filter === 'all' ? 'bg-gray-100 font-medium text-gray-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <FileText size={14} /> All ({contentDrafts.length})
          </button>
          <button
            onClick={() => setFilter('pending_doreen')}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              filter === 'pending_doreen' ? 'bg-amber-100 font-medium text-amber-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Clock size={14} /> Pending ({pending.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              filter === 'approved' ? 'bg-emerald-100 font-medium text-emerald-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <CheckCircle size={14} /> Approved ({approved.length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              filter === 'rejected' ? 'bg-red-100 font-medium text-red-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <XCircle size={14} /> Rejected ({rejected.length})
          </button>
        </div>

        {/* Content Cards */}
        <div className="space-y-4">
          {filtered.map(draft => (
            <div key={draft.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                <span className="text-lg">{typeIcon(draft.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{draft.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 uppercase">{typeLabel(draft.type)}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{draft.agent}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(draft.createdAt)}</span>
                  </div>
                </div>
                <Badge status={draft.status} />
              </div>
              <div className="px-5 py-4">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {draft.content}
                </pre>
                {draft.customerName && (
                  <p className="text-xs text-gray-400 mt-3">Customer: {draft.customerName}</p>
                )}
              </div>
              {draft.status === 'pending_doreen' && (
                <div className="px-5 py-3 border-t border-gray-100 bg-amber-50/50 flex items-center gap-3">
                  <button className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="px-4 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1.5">
                    <XCircle size={14} /> Reject
                  </button>
                  <span className="text-[10px] text-amber-600 ml-auto">Awaiting Doreen&apos;s review</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
