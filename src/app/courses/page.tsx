import Link from "next/link";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { courses } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default async function CoursesPage() {
  const rows = await db.select().from(courses).where(eq(courses.visibility, "published")).orderBy(asc(courses.sortOrder));

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black">الكورسات المتاحة</h1>
          <p className="mt-2 text-slate-300">اكتشف المحتوى التدريبي المتاح للشراء أو البدء المجاني.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((course) => (
            <Card key={course.id}>
              <div className="mb-4 flex items-center justify-between">
                <Pill>{course.instructorName}</Pill>
                <span className="text-cyan-300">{formatCurrency(course.price, course.currency)}</span>
              </div>
              <h2 className="text-xl font-bold">{course.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{course.description}</p>
              <Link href={`/courses/${course.id}`} className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-4 py-2 font-bold text-slate-950">تفاصيل الكورس</Link>
            </Card>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
