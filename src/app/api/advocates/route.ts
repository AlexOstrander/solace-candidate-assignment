import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "@/db/seed/advocates";
import { ilike, or, sql } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = (url.searchParams.get("q") ?? "").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE))
    );
    const offset = (page - 1) * pageSize;

    // Fallback: in-memory data when DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      const filtered = search
        ? advocateData.filter((a) => {
            const s = search.toLowerCase();
            return (
              a.firstName.toLowerCase().includes(s) ||
              a.lastName.toLowerCase().includes(s) ||
              a.city.toLowerCase().includes(s) ||
              a.degree.toLowerCase().includes(s) ||
              String(a.yearsOfExperience).includes(s) ||
              a.specialties.some((sp) => sp.toLowerCase().includes(s))
            );
          })
        : advocateData;

      const pageData = filtered.slice(offset, offset + pageSize);

      return Response.json({
        data: pageData,
        total: filtered.length,
        page,
        pageSize,
      });
    }

    // Real DB path
    const pattern = `%${search}%`;

    const where =
      search.length > 0
        ? or(
            ilike(advocates.firstName, pattern),
            ilike(advocates.lastName, pattern),
            ilike(advocates.city, pattern),
            ilike(advocates.degree, pattern),
            // specialties may be jsonb/text/array; treat as text to avoid "cannot extract elements from a scalar"
            sql`(${advocates.specialties}::text ILIKE ${pattern})`,
            sql`CAST(${advocates.yearsOfExperience} AS TEXT) ILIKE ${pattern}`
          )
        : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(advocates)
        .where(where)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(advocates)
        .where(where ?? sql`TRUE`),
    ]);

    return Response.json({
      data: rows,
      total: count,
      page,
      pageSize,
    });
  } catch (e) {
    console.error(e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
