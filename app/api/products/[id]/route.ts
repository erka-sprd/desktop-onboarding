import { NextResponse } from "next/server"

const SHOP_ID = "205909"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = `https://api.spreadshirt.net/api/v1/shops/${SHOP_ID}/productTypes/${id}?mediaType=json&fullData=true`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream ${res.status}` },
      { status: res.status }
    )
  }
  const data = await res.json()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  })
}
