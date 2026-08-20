import { NextResponse } from "next/server";
import { getExploreCatalogue } from "@/lib/explore/catalogue";
import { getEnv } from "@/lib/env";
import { getMockStore } from "@/lib/mock/store";

export async function GET() {
  if (getEnv().USE_MOCK_API) {
    const store = getMockStore();
    return NextResponse.json(store.getExplore());
  }

  return NextResponse.json(getExploreCatalogue());
}
