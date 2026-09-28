import Link from "next/link";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
import { db } from "@/db";
import { enrollments, payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      studentPhone: users.studentPhone,
      parentPhone: users.parentPhone,
      motherPhone: users.motherPhone,
      createdAt: users.createdAt,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      coursesCount: sql<number>`(select count(*) from ${enrollments} where ${enrollments.userId} = ${users.id})`,
      paidCount: sql<number>`(select count(*) from ${payments} where ${payments.userId} = ${users.id} and ${payments.status} = 'paid')`,
    })
    .from(users)
    .where(sql`${users.role} = 'student'`)
    .orderBy(desc(users.createdAt));

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black">إدارة الطلاب</h1>
          <Link href="/admin" className="text-cyan-300">العودة للوحة التحكم</Link>
        </div>
        <div className="grid gap-4">
          {rows.map((student) => (
            <Card key={student.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="text-xl font-bold">{student.fullName}</div>
                  <div className="text-sm text-slate-300">رقم الطالب: {student.studentPhone}</div>
                  <div className="text-sm text-slate-300">رقم ولي الأمر: {student.parentPhone}</div>
                  <div className="text-sm text-slate-300">رقم الأم: {student.motherPhone}</div>
                  <div className="text-sm text-slate-400">أنشئ في: {formatDate(student.createdAt)}</div>
                  <div className="text-sm text-slate-400">آخر دخول: {formatDate(student.lastLoginAt)}</div>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <Pill tone={student.status === "active" ? "success" : student.status === "suspended" ? "warn" : "danger"}>{student.status}</Pill>
                  <div className="text-sm text-slate-300">الكورسات المسجل بها: {student.coursesCount}</div>
                  <div className="text-sm text-slate-300">المدفوعات الناجحة: {student.paidCount}</div>
                  <Link href={`/admin/students/${student.id}`} className="rounded-2xl bg-cyan-400 px-4 py-2 font-bold text-slate-950">عرض التفاصيل</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
