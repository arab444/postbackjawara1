"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MousePointer2, Users, DollarSign, TrendingUp, Download, RefreshCw } from "lucide-react"
import type { ConversionData } from "@/lib/types"
import { getConversions, getStats, exportToCSV } from "@/lib/storage"

export default function Dashboard() {
  const [conversions, setConversions] = useState<ConversionData[]>([])
  const [filteredConversions, setFilteredConversions] = useState<ConversionData[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [subIdFilter, setSubIdFilter] = useState("")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalLeads: 0,
    totalRevenue: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    loadData()
    // Set default date range (last 7 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    filterData()
  }, [conversions, startDate, endDate, subIdFilter, networkFilter, typeFilter])

  const loadData = () => {
    const data = getConversions()
    setConversions(data)
  }

  const filterData = () => {
    let filtered = [...conversions]

    // Date filter
    if (startDate) {
      filtered = filtered.filter((c) => new Date(c.timestamp) >= new Date(startDate))
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      filtered = filtered.filter((c) => new Date(c.timestamp) <= endDateTime)
    }

    // Sub ID filter
    if (subIdFilter) {
      filtered = filtered.filter((c) => c.subId.toLowerCase().includes(subIdFilter.toLowerCase()))
    }

    // Network filter
    if (networkFilter !== "all") {
      filtered = filtered.filter((c) => c.network === networkFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.type === typeFilter)
    }

    setFilteredConversions(filtered)

    // Calculate stats
    const calculatedStats = getStats(filtered)
    setStats(calculatedStats)
  }

  const handleExport = () => {
    exportToCSV(filteredConversions)
  }

  const handleRefresh = () => {
    loadData()
  }

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      clickdealer: "bg-blue-500",
      trafee: "bg-green-500",
      adverten: "bg-purple-500",
    }
    return colors[network] || "bg-gray-500"
  }

  const getTypeColor = (type: string) => {
    return type === "lead" ? "bg-emerald-500" : "bg-sky-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">CPA Postback Tracker</h1>
            <p className="text-muted-foreground mt-2">Monitor konversi dari ClickDealer, Trafee, dan Adverten</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="default" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua klik yang tercatat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">Konversi yang berhasil</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total penghasilan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Lead / Click ratio</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Filter konversi berdasarkan tanggal, sub ID, dan network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subId">Sub ID</Label>
                <Input
                  id="subId"
                  type="text"
                  placeholder="Cari sub ID..."
                  value={subIdFilter}
                  onChange={(e) => setSubIdFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select value={networkFilter} onValueChange={setNetworkFilter}>
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Pilih network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Network</SelectItem>
                    <SelectItem value="clickdealer">ClickDealer</SelectItem>
                    <SelectItem value="trafee">Trafee</SelectItem>
                    <SelectItem value="adverten">Adverten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="click">Click</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Konversi</CardTitle>
            <CardDescription>
              Menampilkan {filteredConversions.length} dari {conversions.length} konversi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Sub ID</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Tidak ada data konversi yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConversions.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell className="font-medium">
                          {new Date(conversion.timestamp).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getNetworkColor(conversion.network)}>{conversion.network}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(conversion.type)}>{conversion.type}</Badge>
                        </TableCell>
                        <TableCell>{conversion.subId}</TableCell>
                        <TableCell className="font-mono text-sm">{conversion.transactionId}</TableCell>
                        <TableCell className="font-semibold">${conversion.payout.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{conversion.ipAddress}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Postback URL Info */}
        <Card>
          <CardHeader>
            <CardTitle>Postback URL Configuration</CardTitle>
            <CardDescription>Gunakan URL ini untuk setup postback di CPA network Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold text-sm">Universal Postback URL:</p>
              <code className="text-sm bg-background p-2 rounded block overflow-x-auto">
                {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
                /api/postback?network=NETWORK&type=TYPE&subid=SUBID&txid=TXID&payout=PAYOUT&ip=IP
              </code>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm mb-1">ClickDealer Example:</p>
                <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                  {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
                  /api/postback?network=clickdealer&type=lead&subid={"[subid]"}&txid={"[transaction_id]"}&payout=
                  {"[payout]"}&ip={"[ip]"}
                </code>
              </div>

              <div>
                <p className="font-semibold text-sm mb-1">Trafee Example:</p>
                <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                  {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
                  /api/postback?network=trafee&type=lead&subid={"[sub_id]"}&txid={"[txn_id]"}&payout={"[payout]"}&ip=
                  {"[user_ip]"}
                </code>
              </div>

              <div>
                <p className="font-semibold text-sm mb-1">Adverten Example:</p>
                <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                  {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
                  /api/postback?network=adverten&type=lead&subid={"[aff_sub]"}&txid={"[transaction]"}&payout=
                  {"[payout]"}&ip={"[ip_address]"}
                </code>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Parameter Info:</strong> Ganti placeholder dengan macro yang sesuai dari masing-masing network.
                Sistem akan otomatis mendeteksi dan memproses postback dari ketiga network.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
