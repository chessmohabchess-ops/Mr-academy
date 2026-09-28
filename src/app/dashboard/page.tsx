import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
import { db } from "@/db";
import { enrollments, notifications, progress, supportTickets } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const session = await requireAuth();
  const myEnrollments = await db.select().from(enrollments).where(eq(enrollments.userId, session.user.id)).orderBy(desc(enrollments.createdAt));
  const myNotifications = await db.select().from(notifications).where(eq(notifications.userId, session.user.id)).orderBy(desc(notifications.createdAt)).limit(5);
  const myTickets = await db.select().from(supportTickets).where(eq(supportTickets.userId, session.user.id)).orderBy(desc(supportTickets.updatedAt)).limit(5);
  const progressRows = await db.select({ count: sql<number>`count(*)` }).from(progress).where(eq(progress.userId, session.user.id));

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">لوحة الطالب</h1>
            <p className="mt-2 text-slate-300">مرحبًا {session.user.fullName}</p>
          </div>
          <Pill tone="success">{session.user.status}</Pill>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card><div className="text-sm text-slate-400">الكورسات</div><div className="mt-3 text-3xl font-black">{myEnrollments.length}</div></Card>
          <Card><div className="text-sm text-slate-400">الإشعارات</div><div className="mt-3 text-3xl font-black">{myNotifications.length}</div></Card>
          <Card><div className="text-sm text-slate-400">التذاكر</div><div className="mt-3 text-3xl font-black">{myTickets.length}</div></Card>
          <Card><div className="text-sm text-slate-400">سجلات التقدم</div><div className="mt-3 text-3xl font-black">{progressRows[0]?.count ?? 0}</div></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-bold">صلاحياتي الحالية</h2>
            <div className="grid gap-3">
              {myEnrollments.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <Pill tone={item.status === "active" ? "success" : item.status === "pending" ? "warn" : "danger"}>{item.status}</Pill>
                    <span className="text-sm text-slate-400">من {formatDate(item.startsAt)} إلى {formatDate(item.endsAt)}</span>
                  </div>
                  <Link href={`/dashboard/courses/${item.courseId}`} className="mt-3 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">دخول الكورس</Link>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold">آخر الإشعارات</h2>
            <div className="grid gap-3">
              {myNotifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="font-bold">{item.title}</div>
                  <div className="mt-2 text-sm text-slate-300">{item.body}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}
