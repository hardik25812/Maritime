'use client'

import TopBar from '@/components/TopBar'
import { agents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Activity, Zap, Clock, CheckCircle } from 'lucide-react'

export default function AgentsClient() {
  return (
    <div>
      <TopBar title="Agent Team" subtitle="5 AI agents managing revenue, reviews, SEO, email, and content" />

      <div className="p-6 space-y-6">
        {/* Agent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map(agent => (
            <div key={agent.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header bar with agent color */}
              <div className="h-1.5" style={{ backgroundColor: agent.color }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${agent.color}15` }}>
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        agent.status === 'active' ? 'bg-emerald-400 agent-active' :
                        agent.status === 'alert' ? 'bg-amber-400' :
                        agent.status === 'idle' ? 'bg-gray-300' : 'bg-red-400'
                      )} />
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{agent.status}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{agent.role}</p>

                {/* Last Action */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity size={12} className="text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-400 uppercase">Last Action</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{agent.lastAction}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{agent.lastActionTime}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Zap size={12} className="text-amber-500" />
                      <span className="text-lg font-bold text-gray-800">{agent.tasksToday}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Today</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span className="text-lg font-bold text-gray-800">{agent.tasksTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">All Time</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock size={12} className="text-blue-500" />
                      <span className="text-lg font-bold text-gray-800">24/7</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* n8n Workflow Connection Map */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Workflow Connection Map</h2>
          <div className="bg-gray-50 rounded-lg p-5 font-mono text-xs leading-loose text-gray-600">
            <p><span className="text-amber-600 font-bold">SCOUT</span> monitors daily → detects spam pages → flags <span className="text-red-600">SECURITY ALERT</span></p>
            <p className="mt-2"><span className="text-purple-600 font-bold">IRIS</span> receives customer emails → GPT-4o sentiment scoring</p>
            <p className="pl-6">├── Score ≥ 8 → adds to <span className="text-emerald-600">Backlog</span> sheet</p>
            <p className="pl-6">└── Score &lt; 8 → alerts <span className="text-amber-600">Doreen privately</span></p>
            <p className="mt-2"><span className="text-blue-600 font-bold">ECHO</span> reads Backlog → GPT-4o personalized emails → <span className="text-amber-600">Doreen approves</span></p>
            <p className="pl-6">└── Approved → sends review request to customer</p>
            <p className="mt-2"><span className="text-emerald-600 font-bold">ATLAS</span> monitors WooCommerce → cart abandoned?</p>
            <p className="pl-6">├── 1hr: gentle reminder</p>
            <p className="pl-6">├── 24hr: social proof</p>
            <p className="pl-6">└── 72hr: BOGO (2+ items) or urgency (1 item)</p>
            <p className="mt-2"><span className="text-yellow-600 font-bold">HERALD</span> generates category pages → <span className="text-amber-600">Doreen approves</span> → publishes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
