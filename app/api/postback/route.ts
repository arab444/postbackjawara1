import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  return handleIncomingPostback(request)
}

export async function POST(request: NextRequest) {
  return handleIncomingPostback(request)
}

function handleIncomingPostback(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract parameters from URL
    const network = searchParams.get("network")?.toLowerCase() || "unknown"
    const type = searchParams.get("type")?.toLowerCase() || "lead"
    const subId = searchParams.get("subid") || searchParams.get("sub_id") || searchParams.get("aff_sub") || "unknown"
    const transactionId =
      searchParams.get("txid") ||
      searchParams.get("txn_id") ||
      searchParams.get("transaction") ||
      searchParams.get("transaction_id") ||
      "unknown"
    const payout = Number.parseFloat(searchParams.get("payout") || "0")
    const ipAddress =
      searchParams.get("ip") ||
      searchParams.get("user_ip") ||
      searchParams.get("ip_address") ||
      request.headers.get("x-forwarded-for") ||
      "unknown"

    // Validate network
    const validNetworks = ["clickdealer", "trafee", "adverten"]
    if (!validNetworks.includes(network) && network !== "unknown") {
      return NextResponse.json({ status: "error", message: "Invalid network" }, { status: 400 })
    }

    // Create conversion data
    const conversion = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      network,
      type,
      subId,
      transactionId,
      payout,
      ipAddress,
      timestamp: new Date().toISOString(),
      rawParams: Object.fromEntries(searchParams.entries()),
    }

    // Return success with postback pixel
    const response = NextResponse.json({
      status: "success",
      message: "Postback received",
      data: conversion,
    })

    // Add tracking pixel headers
    response.headers.set("Content-Type", "application/json")
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")

    return response
  } catch (error) {
    console.error("Postback processing error:", error)
    return NextResponse.json({ status: "error", message: "Failed to process postback" }, { status: 500 })
  }
}
