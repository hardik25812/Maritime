import type {
  Agent, DailyBrief, AlertItem, SEOKeyword, IndexCoverage, SpamPage,
  CartAbandonment, ReviewRequest, MilestoneCheckIn, MailChimpAttribution,
  ContentDraft, WeeklyTrend
} from './types'

export const agents: Agent[] = [
  {
    name: 'ATLAS', fullName: 'ATLAS — Revenue Recovery',
    role: 'Monitors failed payments, cart abandonment, WooCommerce webhooks',
    status: 'active', icon: '💰', color: '#059669',
    lastAction: 'Sent recovery email for cart #4892 ($247)',
    lastActionTime: '12 min ago', tasksToday: 7, tasksTotal: 1243
  },
  {
    name: 'IRIS', fullName: 'IRIS — Review Intelligence',
    role: 'Sentiment routing, timing optimization, Google review pipeline',
    status: 'active', icon: '⭐', color: '#8b5cf6',
    lastAction: 'Queued review request for Margaret T. (Sentiment: 9.2)',
    lastActionTime: '34 min ago', tasksToday: 3, tasksTotal: 847
  },
  {
    name: 'ECHO', fullName: 'ECHO — Email Automation',
    role: 'MailChimp sequences, cart abandonment, win-back campaigns',
    status: 'active', icon: '📧', color: '#2563eb',
    lastAction: 'Triggered Touch 2 for 4 abandoned carts',
    lastActionTime: '1 hr ago', tasksToday: 14, tasksTotal: 3621
  },
  {
    name: 'SCOUT', fullName: 'SCOUT — SEO Watchdog',
    role: 'Tracks rankings daily, monitors index coverage, flags spam injections',
    status: 'alert', icon: '🔍', color: '#d97706',
    lastAction: '⚠️ Detected 2 new "andevtemp" pages — flagged for removal',
    lastActionTime: '2 hrs ago', tasksToday: 48, tasksTotal: 8920
  },
  {
    name: 'HERALD', fullName: 'HERALD — Content Publisher',
    role: 'Generates category page content, title tags, meta descriptions',
    status: 'idle', icon: '📝', color: '#c9a84c',
    lastAction: 'Published 3 category meta descriptions (Doreen approved)',
    lastActionTime: '5 hrs ago', tasksToday: 3, tasksTotal: 412
  }
]

export const dailyBrief: DailyBrief = {
  revenue: {
    ordersToday: 11, ordersThisWeek: 68, ordersMTD: 247,
    revenueToday: 1980, revenueThisWeek: 12240, revenueMTD: 44460,
    aov: 180
  },
  seo: {
    indexedPages: 10, indexedTarget: 2500,
    topKeywords: [
      { keyword: 'needlepoint kits', position: 14, change: 0 },
      { keyword: 'needlepoint canvas', position: 18, change: 2 },
      { keyword: 'needlepoint supplies', position: 22, change: -1 }
    ],
    spamPagesFound: 279, spamPagesRemoved: 261
  },
  reviews: {
    newReviews: 2, pendingRequests: 8, avgRating: 4.3,
    totalReviews: 35, reviewTarget: 100
  },
  recovery: {
    abandonedCarts: 12, recoveredCarts: 3, recoveredRevenue: 540,
    failedPayments: 2, recoveredPayments: 1, emailsSent: 18
  },
  alerts: [
    { id: 'a1', severity: 'critical', agent: 'SCOUT', message: '2 new casino spam pages detected (author: andevtemp) — immediate removal required', timestamp: '2026-04-16T09:15:00Z', acknowledged: false },
    { id: 'a2', severity: 'warning', agent: 'SCOUT', message: 'Index coverage dropped: only 10 pages indexed (was 14 yesterday)', timestamp: '2026-04-16T08:00:00Z', acknowledged: false },
    { id: 'a3', severity: 'warning', agent: 'ATLAS', message: 'Payment processor timeout — 2 failed payments in last hour', timestamp: '2026-04-16T10:30:00Z', acknowledged: true },
    { id: 'a4', severity: 'info', agent: 'IRIS', message: '3 new review drafts awaiting Doreen approval', timestamp: '2026-04-16T07:00:00Z', acknowledged: true },
    { id: 'a5', severity: 'info', agent: 'HERALD', message: 'Category pages for "Christmas Ornaments" and "Stocking Kits" ready for review', timestamp: '2026-04-16T06:00:00Z', acknowledged: true }
  ]
}

export const seoKeywords: SEOKeyword[] = [
  { keyword: 'needlepoint kits', currentPosition: 14, previousPosition: 14, change: 0, searchVolume: 12100, url: '/needlepoint-kits' },
  { keyword: 'needlepoint canvas', currentPosition: 18, previousPosition: 16, change: -2, searchVolume: 8100, url: '/needlepoint-canvas' },
  { keyword: 'needlepoint supplies', currentPosition: 22, previousPosition: 23, change: 1, searchVolume: 6600, url: '/needlepoint-supplies' },
  { keyword: 'needlepoint christmas ornaments', currentPosition: 8, previousPosition: 11, change: 3, searchVolume: 4400, url: '/christmas-ornaments' },
  { keyword: 'needlepoint stocking kits', currentPosition: 6, previousPosition: 7, change: 1, searchVolume: 3200, url: '/stocking-kits' },
  { keyword: 'hand painted needlepoint canvas', currentPosition: 19, previousPosition: 21, change: 2, searchVolume: 2900, url: '/hand-painted-canvas' },
  { keyword: 'needlepoint pillows', currentPosition: 25, previousPosition: 28, change: 3, searchVolume: 2400, url: '/pillows' },
  { keyword: 'needlepoint belts', currentPosition: 12, previousPosition: 15, change: 3, searchVolume: 1900, url: '/belts' },
  { keyword: 'art needlepoint', currentPosition: 3, previousPosition: 3, change: 0, searchVolume: 1600, url: '/' },
  { keyword: 'beginner needlepoint kit', currentPosition: 31, previousPosition: 35, change: 4, searchVolume: 5400, url: '/beginner-kits' }
]

export const indexCoverageHistory: IndexCoverage[] = [
  { date: '2026-03-01', indexed: 1847, submitted: 2500, excluded: 420, error: 233 },
  { date: '2026-03-08', indexed: 1200, submitted: 2500, excluded: 800, error: 500 },
  { date: '2026-03-15', indexed: 340, submitted: 2500, excluded: 1600, error: 560 },
  { date: '2026-03-22', indexed: 45, submitted: 2500, excluded: 2000, error: 455 },
  { date: '2026-03-29', indexed: 18, submitted: 2500, excluded: 2200, error: 282 },
  { date: '2026-04-05', indexed: 12, submitted: 2500, excluded: 2300, error: 188 },
  { date: '2026-04-12', indexed: 10, submitted: 2500, excluded: 2350, error: 140 },
  { date: '2026-04-16', indexed: 10, submitted: 2500, excluded: 2350, error: 140 }
]

export const spamPages: SpamPage[] = [
  { id: 's1', url: '/best-online-casino-slots-2025', author: 'andevtemp', detectedAt: '2026-04-16T09:12:00Z', status: 'detected', title: 'Best Online Casino Slots 2025 - Win Big!' },
  { id: 's2', url: '/free-casino-bonus-no-deposit', author: 'andevtemp', detectedAt: '2026-04-16T09:14:00Z', status: 'detected', title: 'Free Casino Bonus No Deposit Required' },
  { id: 's3', url: '/online-poker-real-money-usa', author: 'andevtemp', detectedAt: '2026-04-10T14:00:00Z', status: 'removed', title: 'Online Poker Real Money USA' },
  { id: 's4', url: '/sports-betting-tips-2025', author: 'andevtemp', detectedAt: '2026-04-09T11:00:00Z', status: 'removed', title: 'Sports Betting Tips 2025' },
  { id: 's5', url: '/bitcoin-casino-reviews', author: 'andevtemp', detectedAt: '2026-04-08T08:00:00Z', status: 'removed', title: 'Bitcoin Casino Reviews Top 10' }
]

export const cartAbandonments: CartAbandonment[] = [
  { id: 'c1', customerName: 'Sarah Mitchell', customerEmail: 'sarah.m@gmail.com', cartTotal: 247, items: ['Jolly Santa Stocking Kit', 'Gold Metallic Thread Set'], abandonedAt: '2026-04-16T08:15:00Z', touchesSent: 1, status: 'active' },
  { id: 'c2', customerName: 'Jennifer Adams', customerEmail: 'j.adams@outlook.com', cartTotal: 189, items: ['Hydrangea Pillow Canvas'], abandonedAt: '2026-04-15T14:30:00Z', touchesSent: 2, status: 'active' },
  { id: 'c3', customerName: 'Patricia Wong', customerEmail: 'pwong@yahoo.com', cartTotal: 312, items: ['Winter Village Landscape', 'Tapestry Needle Set', 'DMC Thread Bundle'], abandonedAt: '2026-04-14T19:00:00Z', touchesSent: 2, status: 'active' },
  { id: 'c4', customerName: 'Linda Kraft', customerEmail: 'lindakraft@gmail.com', cartTotal: 156, items: ['Monogram Belt Canvas'], abandonedAt: '2026-04-13T10:45:00Z', touchesSent: 3, status: 'recovered', recoveredAt: '2026-04-15T09:00:00Z' },
  { id: 'c5', customerName: 'Mary Chen', customerEmail: 'mchen@icloud.com', cartTotal: 423, items: ['Chinoiserie Panel', 'Persian Wool Set'], abandonedAt: '2026-04-12T16:20:00Z', touchesSent: 3, status: 'expired' },
  { id: 'c6', customerName: 'Karen Russo', customerEmail: 'krusso@gmail.com', cartTotal: 98, items: ['Christmas Ornament — Nutcracker'], abandonedAt: '2026-04-16T11:00:00Z', touchesSent: 0, status: 'active' }
]

export const reviewRequests: ReviewRequest[] = [
  { id: 'r1', customerName: 'Margaret Thompson', customerEmail: 'mthompson@gmail.com', product: 'Tropical Parrot Canvas', orderDate: '2026-03-28', deliveryDate: '2026-04-02', scheduledSendDate: '2026-04-09', sentimentScore: 9.2, sentiment: 'delighted', status: 'awaiting_doreen' },
  { id: 'r2', customerName: 'Barbara Nelson', customerEmail: 'b.nelson@yahoo.com', product: 'Nautical Anchor Belt', orderDate: '2026-03-25', deliveryDate: '2026-03-30', scheduledSendDate: '2026-04-06', sentimentScore: 8.5, sentiment: 'satisfied', status: 'approved' },
  { id: 'r3', customerName: 'Dorothy Miller', customerEmail: 'dotmiller@aol.com', product: 'Rose Garden Pillow', orderDate: '2026-03-20', deliveryDate: '2026-03-26', scheduledSendDate: '2026-04-02', sentimentScore: 9.0, sentiment: 'delighted', status: 'reviewed', googleReviewUrl: 'https://g.page/r/artneedlepoint/review/r3' },
  { id: 'r4', customerName: 'Susan Park', customerEmail: 'spark@gmail.com', product: 'Holiday Stocking — Snowflakes', orderDate: '2026-04-01', deliveryDate: '2026-04-07', scheduledSendDate: '2026-04-14', sentimentScore: 7.8, sentiment: 'satisfied', status: 'sent' },
  { id: 'r5', customerName: 'Helen Garcia', customerEmail: 'hgarcia@hotmail.com', product: 'Floral Eyeglass Case', orderDate: '2026-04-03', deliveryDate: '2026-04-09', scheduledSendDate: '2026-04-16', status: 'scheduled' },
  { id: 'r6', customerName: 'Nancy Clark', customerEmail: 'n.clark@gmail.com', product: 'Bee & Lavender Canvas', orderDate: '2026-04-02', deliveryDate: '2026-04-08', scheduledSendDate: '2026-04-15', sentimentScore: 8.8, sentiment: 'delighted', status: 'awaiting_doreen' },
  { id: 'r7', customerName: 'Ruth Davis', customerEmail: 'ruthdavis@outlook.com', product: 'Preppy Whale Belt', orderDate: '2026-04-05', deliveryDate: '2026-04-10', scheduledSendDate: '2026-04-17', status: 'scheduled' },
  { id: 'r8', customerName: 'Carol Lewis', customerEmail: 'carol.l@gmail.com', product: 'Chinoiserie Pillow', orderDate: '2026-03-18', deliveryDate: '2026-03-24', scheduledSendDate: '2026-03-31', sentimentScore: 4.2, sentiment: 'frustrated', status: 'rejected' }
]

export const milestoneCheckIns: MilestoneCheckIn[] = [
  { id: 'm1', customerName: 'Alice Morgan', customerEmail: 'alice.m@gmail.com', product: 'Christmas Nutcracker Ornament', productCategory: 'small', orderDate: '2026-03-20', checkInDate: '2026-04-10', status: 'positive', response: 'Almost done! It looks so cute on the tree. Love the metallic gold thread.', routedTo: 'review_queue' },
  { id: 'm2', customerName: 'Betty Robinson', customerEmail: 'brobinson@yahoo.com', product: 'Monet Water Lilies Canvas (24x30)', productCategory: 'large', orderDate: '2026-01-05', checkInDate: '2026-04-28', status: 'scheduled' },
  { id: 'm3', customerName: 'Christine Taylor', customerEmail: 'ctaylor@icloud.com', product: 'Coastal Lighthouse Pillow Kit', productCategory: 'medium', orderDate: '2026-02-10', checkInDate: '2026-04-07', status: 'stuck', response: "I'm having trouble with the sky gradient section. The blues are confusing.", routedTo: 'doreen_support' },
  { id: 'm4', customerName: 'Diana White', customerEmail: 'dwhite@gmail.com', product: 'Monogram Belt Canvas — "DW"', productCategory: 'medium', orderDate: '2026-02-15', checkInDate: '2026-04-12', status: 'finished', response: "Finished last weekend! It turned out amazing. My husband loves it. Can I send you a photo?", routedTo: 'strut_your_stitches' },
  { id: 'm5', customerName: 'Elizabeth Scott', customerEmail: 'escott@outlook.com', product: 'Angel Tree Topper Kit', productCategory: 'small', orderDate: '2026-03-25', checkInDate: '2026-04-15', status: 'sent' },
  { id: 'm6', customerName: 'Frances Hall', customerEmail: 'fhall@gmail.com', product: 'Persian Rug Masterpiece (36x48)', productCategory: 'large', orderDate: '2025-11-10', checkInDate: '2026-03-01', status: 'no_response', response: undefined, routedTo: undefined },
  { id: 'm7', customerName: 'Gloria King', customerEmail: 'gking@aol.com', product: 'Gingerbread House Stocking', productCategory: 'medium', orderDate: '2026-02-20', checkInDate: '2026-04-17', status: 'scheduled' }
]

export const mailchimpAttribution: MailChimpAttribution[] = [
  { date: '2026-03-04', emailsSent: 24800, emailsOpened: 9920, ordersWithin48h: 42, attributedRevenue: 7560, openRate: 40 },
  { date: '2026-03-11', emailsSent: 24900, emailsOpened: 10209, ordersWithin48h: 38, attributedRevenue: 6840, openRate: 41 },
  { date: '2026-03-18', emailsSent: 24950, emailsOpened: 9980, ordersWithin48h: 45, attributedRevenue: 8100, openRate: 40 },
  { date: '2026-03-25', emailsSent: 25000, emailsOpened: 10500, ordersWithin48h: 51, attributedRevenue: 9180, openRate: 42 },
  { date: '2026-04-01', emailsSent: 25050, emailsOpened: 10271, ordersWithin48h: 47, attributedRevenue: 8460, openRate: 41 },
  { date: '2026-04-08', emailsSent: 25100, emailsOpened: 10542, ordersWithin48h: 53, attributedRevenue: 9540, openRate: 42 },
  { date: '2026-04-15', emailsSent: 25150, emailsOpened: 10563, ordersWithin48h: 49, attributedRevenue: 8820, openRate: 42 }
]

export const contentDrafts: ContentDraft[] = [
  { id: 'd1', type: 'email_draft', agent: 'IRIS', title: 'Review Request — Margaret Thompson (Tropical Parrot Canvas)', content: 'Hi Margaret,\n\nWe hope you\'re enjoying your Tropical Parrot Canvas! Your words made our day — "The colors are even more vibrant than the photo."...',  status: 'pending_doreen', createdAt: '2026-04-16T07:00:00Z', customerName: 'Margaret Thompson' },
  { id: 'd2', type: 'email_draft', agent: 'IRIS', title: 'Review Request — Nancy Clark (Bee & Lavender Canvas)', content: 'Hi Nancy,\n\nHow wonderful to hear you\'re already halfway through the Bee & Lavender Canvas! We couldn\'t agree more that...', status: 'pending_doreen', createdAt: '2026-04-15T14:00:00Z', customerName: 'Nancy Clark' },
  { id: 'd3', type: 'category_page', agent: 'HERALD', title: 'Category Page: Christmas Ornament Needlepoint Kits', content: '## Handpainted Christmas Ornament Needlepoint Kits\n\nDeck your tree with one-of-a-kind ornaments...', status: 'pending_doreen', createdAt: '2026-04-16T06:00:00Z' },
  { id: 'd4', type: 'meta_description', agent: 'HERALD', title: 'Meta: Needlepoint Stocking Kits Page', content: 'Shop hand-painted needlepoint stocking kits from Art Needlepoint. Heirloom-quality canvases, complete kits with threads & guide. Free shipping over $100.', status: 'approved', createdAt: '2026-04-15T10:00:00Z', reviewedAt: '2026-04-15T16:00:00Z' },
  { id: 'd5', type: 'category_page', agent: 'HERALD', title: 'Category Page: Needlepoint Belt Kits', content: '## Custom Needlepoint Belt Kits\n\nCraft a belt as unique as you are...', status: 'approved', createdAt: '2026-04-14T09:00:00Z', reviewedAt: '2026-04-14T17:00:00Z' },
  { id: 'd6', type: 'email_draft', agent: 'ECHO', title: 'Win-Back Email — Lapsed Customers (90 days)', content: 'Hi [First Name],\n\nWe haven\'t seen you in a while and wanted to check in...', status: 'pending_doreen', createdAt: '2026-04-16T05:00:00Z' }
]

export const weeklyTrends: WeeklyTrend[] = [
  { week: 'Mar 3', revenue: 52200, orders: 290, reviews: 1, recoveredCarts: 8, indexedPages: 1847 },
  { week: 'Mar 10', revenue: 48600, orders: 270, reviews: 0, recoveredCarts: 5, indexedPages: 1200 },
  { week: 'Mar 17', revenue: 45000, orders: 250, reviews: 1, recoveredCarts: 4, indexedPages: 340 },
  { week: 'Mar 24', revenue: 43200, orders: 240, reviews: 0, recoveredCarts: 3, indexedPages: 45 },
  { week: 'Mar 31', revenue: 46800, orders: 260, reviews: 2, recoveredCarts: 6, indexedPages: 18 },
  { week: 'Apr 7', revenue: 50400, orders: 280, reviews: 3, recoveredCarts: 9, indexedPages: 12 },
  { week: 'Apr 14', revenue: 54000, orders: 300, reviews: 2, recoveredCarts: 11, indexedPages: 10 }
]
