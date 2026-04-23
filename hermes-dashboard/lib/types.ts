export type AgentName = 'ATLAS' | 'IRIS' | 'ECHO' | 'SCOUT' | 'HERALD'

export type AgentStatus = 'active' | 'idle' | 'alert' | 'disabled'

export interface Agent {
  name: AgentName
  fullName: string
  role: string
  status: AgentStatus
  icon: string
  color: string
  lastAction: string
  lastActionTime: string
  tasksToday: number
  tasksTotal: number
}

export interface DailyBrief {
  revenue: {
    ordersToday: number
    ordersThisWeek: number
    ordersMTD: number
    revenueToday: number
    revenueThisWeek: number
    revenueMTD: number
    aov: number
  }
  seo: {
    indexedPages: number
    indexedTarget: number
    topKeywords: { keyword: string; position: number; change: number }[]
    spamPagesFound: number
    spamPagesRemoved: number
  }
  reviews: {
    newReviews: number
    pendingRequests: number
    avgRating: number
    totalReviews: number
    reviewTarget: number
  }
  recovery: {
    abandonedCarts: number
    recoveredCarts: number
    recoveredRevenue: number
    failedPayments: number
    recoveredPayments: number
    emailsSent: number
  }
  alerts: AlertItem[]
}

export interface AlertItem {
  id: string
  severity: 'critical' | 'warning' | 'info'
  agent: AgentName
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface SEOKeyword {
  keyword: string
  currentPosition: number
  previousPosition: number
  change: number
  searchVolume: number
  url: string
}

export interface IndexCoverage {
  date: string
  indexed: number
  submitted: number
  excluded: number
  error: number
}

export interface SpamPage {
  id: string
  url: string
  author: string
  detectedAt: string
  status: 'detected' | 'removed' | 'flagged'
  title: string
}

export interface CartAbandonment {
  id: string
  customerName: string
  customerEmail: string
  cartTotal: number
  items: string[]
  abandonedAt: string
  touchesSent: number
  status: 'active' | 'recovered' | 'expired' | 'unsubscribed'
  recoveredAt?: string
}

export interface ReviewRequest {
  id: string
  customerName: string
  customerEmail: string
  product: string
  orderDate: string
  deliveryDate: string
  scheduledSendDate: string
  sentimentScore?: number
  sentiment?: string
  status: 'scheduled' | 'sent' | 'awaiting_doreen' | 'approved' | 'rejected' | 'reviewed'
  googleReviewUrl?: string
}

export interface MilestoneCheckIn {
  id: string
  customerName: string
  customerEmail: string
  product: string
  productCategory: 'small' | 'medium' | 'large'
  orderDate: string
  checkInDate: string
  status: 'scheduled' | 'sent' | 'positive' | 'stuck' | 'finished' | 'no_response' | 'recheck'
  response?: string
  routedTo?: 'review_queue' | 'doreen_support' | 'strut_your_stitches'
}

export interface MailChimpAttribution {
  date: string
  emailsSent: number
  emailsOpened: number
  ordersWithin48h: number
  attributedRevenue: number
  openRate: number
}

export interface ContentDraft {
  id: string
  type: 'email_draft' | 'category_page' | 'meta_description' | 'title_tag' | 'review_response'
  agent: AgentName
  title: string
  content: string
  status: 'pending_doreen' | 'approved' | 'rejected' | 'published'
  createdAt: string
  reviewedAt?: string
  customerName?: string
}

export interface WeeklyTrend {
  week: string
  revenue: number
  orders: number
  reviews: number
  recoveredCarts: number
  indexedPages: number
}
