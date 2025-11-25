import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "@/db/seed/advocates";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return new Response(
      "DATABASE_URL not set – skipping DB seed (not needed for this local setup).",
      { status: 200 }
    );
  }

  const records = await db.insert(advocates).values(advocateData).returning();

  return Response.json({ advocates: records });
}
