import type { ConversionData, Stats } from "./types"

const STORAGE_KEY = "cpa_conversions"

export function getConversions(): ConversionData[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading conversions:", error)
    return []
  }
}

export function saveConversion(conversion: ConversionData): void {
  if (typeof window === "undefined") return

  try {
    const conversions = getConversions()
    conversions.unshift(conversion)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversions))
  } catch (error) {
    console.error("Error saving conversion:", error)
  }
}

export function getStats(conversions: ConversionData[]): Stats {
  const totalClicks = conversions.filter((c) => c.type === "click").length
  const totalLeads = conversions.filter((c) => c.type === "lead").length
  const totalRevenue = conversions.reduce((sum, c) => sum + c.payout, 0)
  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0

  return {
    totalClicks,
    totalLeads,
    totalRevenue,
    conversionRate,
  }
}

export function exportToCSV(conversions: ConversionData[]): void {
  if (conversions.length === 0) {
    alert("Tidak ada data untuk diekspor")
    return
  }

  const headers = ["Timestamp", "Network", "Type", "Sub ID", "Transaction ID", "Payout", "IP Address"]
  const rows = conversions.map((c) => [
    c.timestamp,
    c.network,
    c.type,
    c.subId,
    c.transactionId,
    c.payout.toString(),
    c.ipAddress,
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `cpa-conversions-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
