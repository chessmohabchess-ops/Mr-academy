import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, payments, sessions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminStudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [student] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!student) notFound();

  const studentSessions = await db.select().from(sessions).where(eq(sessions.userId, id)).orderBy(desc(sessions.lastActivityAt));
  const studentEnrollments = await db
    .select({ enrollment: enrollments, courseTitle: courses.title })
    .from(enrollments)
    .leftJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, id));
  const studentPayments = await db.select().from(payments).where(eq(payments.userId, id)).orderBy(desc(payments.createdAt));

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black">بيانات الطالب</h1>
          <Link href="/admin/students" className="text-cyan-300">عودة</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">البيانات الشخصية</h2>
              <Pill tone={student.status === "active" ? "success" : student.status === "suspended" ? "warn" : "danger"}>{student.status}</Pill>
            </div>
            <div className="grid gap-2 text-sm text-slate-300">
              <div>الاسم الثلاثي: {student.fullName}</div>
              <div>رقم الطالب: {student.studentPhone}</div>
              <div>رقم ولي الأمر: {student.parentPhone}</div>
              <div>رقم الأم: {student.motherPhone}</div>
              <div>البريد الإلكتروني: {student.email || "—"}</div>
              <div>تاريخ إنشاء الحساب: {formatDate(student.createdAt)}</div>
              <div>آخر تسجيل دخول: {formatDate(student.lastLoginAt)}</div>
              <div>حد الأجهزة: {student.deviceLimitEnabled ? student.maxActiveDevices ?? 1 : "غير مفعّل"}</div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold">الجلسات النشطة</h2>
            <div className="grid gap-3">
              {studentSessions.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <Pill tone={item.status === "active" ? "success" : "danger"}>{item.status}</Pill>
                    <span>{formatDate(item.lastActivityAt)}</span>
                  </div>
                  <div className="mt-2">الجهاز: {item.deviceType}</div>
                  <div>المتصفح: {item.browser}</div>
                  <div>النظام: {item.os}</div>
                  <div>IP: {item.ipAddress || "—"}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-bold">الكورسات والصلاحيات</h2>
            <div className="grid gap-3">
              {studentEnrollments.map((item) => (
                <div key={item.enrollment.id} className="rounded-2xl border border-white/10 p-4 text-sm text-slate-300">
                  <div className="font-bold">{item.courseTitle}</div>
                  <div>الحالة: {item.enrollment.status}</div>
                  <div>البداية: {formatDate(item.enrollment.startsAt)}</div>
                  <div>النهاية: {formatDate(item.enrollment.endsAt)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold">المدفوعات</h2>
            <div className="grid gap-3">
              {studentPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-white/10 p-4 text-sm text-slate-300">
                  <div>الحالة: {payment.status}</div>
                  <div>المبلغ: {payment.amount} {payment.currency}</div>
                  <div>التاريخ: {formatDate(payment.createdAt)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}
