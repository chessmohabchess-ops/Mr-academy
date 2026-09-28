import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";
import { canAccessCourse } from "@/lib/access";
import { getSession } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default async function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await getSession();
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) notFound();

  const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).orderBy(asc(sections.sortOrder));
  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.sortOrder));
  const owned = session ? await canAccessCourse(session.user.id, courseId) : false;
  const duration = courseLessons.reduce((sum, lesson) => sum + lesson.videoDurationSeconds, 0);

  return (
    <PageShell>
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
          <Card>
            <Pill tone="success">{course.instructorName}</Pill>
            <h1 className="mt-4 text-4xl font-black">{course.title}</h1>
            <p className="mt-4 text-slate-300">{course.description}</p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div>عدد الدروس: {courseLessons.length}</div>
              <div>عدد الأقسام: {courseSections.length}</div>
              <div>مدة المحتوى: {Math.round(duration / 60)} دقيقة</div>
            </div>
          </Card>
          <Card>
            <div className="text-3xl font-black text-cyan-300">{formatCurrency(course.price, course.currency)}</div>
            <p className="mt-3 text-sm text-slate-300">{owned ? "لديك صلاحية لهذا الكورس" : "يمكنك شراء الكورس لفتح جميع الدروس"}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {owned ? (
                <Link href={`/dashboard/courses/${courseId}`} className="rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950">ابدأ التعلم</Link>
              ) : (
                <form action="/api/payments/create" method="post" className="contents">
                  <button formAction={`/api/payments/create`} className="rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950">شراء الكورس</button>
                </form>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-8 grid gap-4">
          {courseSections.map((section) => (
            <Card key={section.id}>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="mt-4 grid gap-3">
                {courseLessons.filter((lesson) => lesson.sectionId === section.id).map((lesson) => {
                  const locked = !(lesson.freePreview || owned || session?.user.role === "admin");
                  return (
                    <div key={lesson.id} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <div>
                        <div className="font-bold">{lesson.title}</div>
                        <div className="text-sm text-slate-400">{lesson.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.freePreview ? <Pill tone="success">معاينة مجانية</Pill> : null}
                        <Pill tone={locked ? "warn" : "success"}>{locked ? "مقفول" : "متاح"}</Pill>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
