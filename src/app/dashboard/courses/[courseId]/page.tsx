import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, progress, sections } from "@/db/schema";
import { canAccessCourse } from "@/lib/access";
import { requireAuth } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";

export default async function StudentCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await requireAuth();
  const { courseId } = await params;
  const allowed = await canAccessCourse(session.user.id, courseId);
  if (!allowed && session.user.role !== "admin") notFound();

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) notFound();

  const sectionRows = await db.select().from(sections).where(eq(sections.courseId, courseId)).orderBy(asc(sections.sortOrder));
  const lessonRows = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.sortOrder));
  const myProgress = await db.select().from(progress).where(eq(progress.userId, session.user.id));

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black">{course.title}</h1>
          <p className="mt-2 text-slate-300">{course.description}</p>
        </div>

        <div className="grid gap-4">
          {sectionRows.map((section) => (
            <Card key={section.id}>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="mt-4 grid gap-3">
                {lessonRows.filter((lesson) => lesson.sectionId === section.id).map((lesson) => {
                  const itemProgress = myProgress.find((row) => row.lessonId === lesson.id);
                  return (
                    <div key={lesson.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold">{lesson.title}</div>
                        <div className="text-sm text-slate-400">{lesson.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Pill tone={itemProgress?.completed ? "success" : "default"}>{itemProgress?.completed ? "مكتمل" : "قيد المتابعة"}</Pill>
                        <Link href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`} className="rounded-2xl bg-cyan-400 px-4 py-2 font-bold text-slate-950">فتح الدرس</Link>
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
