import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { LoginForm, RegisterForm } from "@/components/forms";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const featuredCourses = await db.select().from(courses).where(eq(courses.visibility, "published")).orderBy(desc(courses.createdAt)).limit(3);

  return (
    <PageShell>
      <Container className="py-10">
        <header className="mb-10 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-l from-cyan-500/20 to-indigo-500/20 p-8">
          <Pill tone="success">منصة عربية Production-ready</Pill>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">منصة تعليمية عربية احترافية لإدارة الكورسات والطلاب والمحتوى والمدفوعات</h1>
          <p className="max-w-3xl text-lg text-slate-300">تدعم RTL، حماية المحتوى المدفوع، جلسات حقيقية، لوحة تحكم للإدارة، اختبارات، دعم فني، إشعارات، وتحليلات شاملة.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">تصفح الكورسات</Link>
            {session ? <Link href={session.user.role === "admin" ? "/admin" : "/dashboard"} className="rounded-2xl border border-white/10 px-5 py-3 font-bold">الانتقال إلى الحساب</Link> : null}
          </div>
        </header>

        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card key={course.id}>
              <div className="mb-4 flex items-center justify-between">
                <Pill>{course.visibility}</Pill>
                <span className="text-cyan-300">{formatCurrency(course.price, course.currency)}</span>
              </div>
              <h2 className="text-xl font-bold">{course.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{course.description}</p>
              <Link href={`/courses/${course.id}`} className="mt-6 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950">عرض الكورس</Link>
            </Card>
          ))}
        </section>

        {!session ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-5 text-2xl font-bold">تسجيل طالب جديد</h2>
              <RegisterForm />
            </Card>
            <Card>
              <h2 className="mb-5 text-2xl font-bold">دخول الطالب أو الإدارة</h2>
              <LoginForm />
            </Card>
          </section>
        ) : null}
      </Container>
    </PageShell>
  );
}
