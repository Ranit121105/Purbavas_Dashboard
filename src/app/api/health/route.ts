export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import("@/db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`select 1`);
      return Response.json({ ok: true, mode: "database" });
    }
    return Response.json({ ok: true, mode: "mock-telemetry", interval: "30m" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection unavailable";
    return Response.json({ ok: true, mode: "mock-telemetry-fallback", note: message });
  }
}
