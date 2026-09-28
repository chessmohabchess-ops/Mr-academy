import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, progress } from "@/db/schema";
import { getAuthorizedLesson } from "@/lib/access";
import { requireAuth } from "@/lib/auth";
import { Container, Card, PageShell, Pill } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";

export default async function LessonWatchPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const session = await requireAuth();
  const { courseId, lessonId } = await params;
  const authorized = await getAuthorizedLesson(session.user.id, courseId, lessonId);
  if (!authorized || authorized.denied) notFound();

  const [lessonProgress] = await db.select().from(progress).where(and(eq(progress.userId, session.user.id), eq(progress.lessonId, lessonId))).limit(1);
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) notFound();

  return (
    <PageShell>
      <Container className="py-10">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">{lesson.title}</h1>
              <p className="mt-2 text-slate-300">{lesson.description}</p>
            </div>
            <Pill tone={lesson.freePreview ? "success" : "default"}>{lesson.freePreview ? "معاينة مجانية" : "مدفوع"}</Pill>
          </div>
          <VideoPlayer src={authorized.playback.url} courseId={courseId} lessonId={lessonId} initialPosition={lessonProgress?.lastPositionSeconds ?? 0} />
        </Card>
      </Container>
    </PageShell>
  );
}
