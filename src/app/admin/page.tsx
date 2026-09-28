import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { getAdminAnalytics } from "@/lib/analytics";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const analytics = await getAdminAnalytics();

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">لوحة تحكم الإدارة</h1>
            <p className="mt-2 text-slate-300">إدارة الطلاب والكورسات والمدفوعات والجلسات والمحتوى.</p>
          </div>
          <Pill tone="success">Admin</Pill>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><div className="text-sm text-slate-400">إجمالي الطلاب</div><div className="mt-3 text-3xl font-black">{analytics.totals.totalStudents}</div></Card>
          <Card><div className="text-sm text-slate-400">إجمالي الكورسات</div><div className="mt-3 text-3xl font-black">{analytics.totals.totalCourses}</div></Card>
          <Card><div className="text-sm text-slate-400">إجمالي المبيعات</div><div className="mt-3 text-3xl font-black">{formatCurrency(analytics.totals.totalSales)}</div></Card>
          <Card><div className="text-sm text-slate-400">الطلاب النشطون</div><div className="mt-3 text-3xl font-black">{analytics.totals.activeStudents}</div></Card>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <Card><div className="text-sm text-slate-400">مبيعات اليوم</div><div className="mt-3 text-2xl font-black">{formatCurrency(analytics.totals.salesToday)}</div></Card>
          <Card><div className="text-sm text-slate-400">مبيعات الأسبوع</div><div className="mt-3 text-2xl font-black">{formatCurrency(analytics.totals.salesWeek)}</div></Card>
          <Card><div className="text-sm text-slate-400">مبيعات الشهر</div><div className="mt-3 text-2xl font-black">{formatCurrency(analytics.totals.salesMonth)}</div></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">أكثر الكورسات شراءً</h2>
              <Link href="/admin/students" className="text-cyan-300">إدارة الطلاب</Link>
            </div>
            <div className="grid gap-3">
              {analytics.topCourses.map((course) => (
                <div key={course.courseId} className="rounded-2xl border border-white/10 p-4">
                  <div className="font-bold">{course.title}</div>
                  <div className="text-sm text-slate-400">عدد المشتريات: {course.purchases}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-xl font-bold">أحدث عمليات الشراء</h2>
            <div className="grid gap-3">
              {analytics.latestPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <Pill tone={payment.status === "paid" ? "success" : payment.status === "pending" ? "warn" : "danger"}>{payment.status}</Pill>
                    <div>{formatCurrency(payment.amount)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{formatDate(payment.createdAt)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}
