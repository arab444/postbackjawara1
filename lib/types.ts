export interface ConversionData {
  id: string
  network: string
  type: "click" | "lead"
  subId: string
  transactionId: string
  payout: number
  ipAddress: string
  timestamp: string
  rawParams?: Record<string, string>
}

export interface Stats {
  totalClicks: number
  totalLeads: number
  totalRevenue: number
  conversionRate: number
}
