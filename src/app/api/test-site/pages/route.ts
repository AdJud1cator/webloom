import { NextResponse } from "next/server";
import { testSitePages } from "@/lib/test-site-data";

export async function GET() {
  return NextResponse.json(testSitePages);
}