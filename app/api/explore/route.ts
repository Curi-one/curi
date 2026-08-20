import { NextResponse } from "next/server";
import { getMockStore } from "@/lib/mock/store";

export async function GET() {
  const store = getMockStore();
  return NextResponse.json(store.getExplore());
}
