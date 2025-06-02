import { NextResponse } from "next/server";
import { ApiSuccess, ApiError, apiHandler } from "@/utils/apiResponse";

// Access global session store
declare global {
  // eslint-disable-next-line no-var
  var sessionStore: Map<string, any>;
}

export async function GET() {
  return apiHandler(async () => {
    const sessionStore = global.sessionStore;

    if (!sessionStore) {
      return ApiSuccess.ok({
        sessionStoreExists: false,
        message: "Session store not initialized",
      });
    }

    const sessions = Array.from(sessionStore.entries()).map(
      ([sessionId, data]) => ({
        sessionId,
        hasLessonContext: !!data.lessonContext,
        lessonTitle: data.lessonContext?.title,
        questionsCount: data.lessonContext?.questions?.length || 0,
        userId: data.userId,
        timestamp: data.timestamp,
        age: Date.now() - data.timestamp,
      })
    );

    return ApiSuccess.ok({
      sessionStoreExists: true,
      totalSessions: sessionStore.size,
      sessions: sessions.slice(0, 10), // Show first 10 sessions
      summary: {
        sessionsWithContext: sessions.filter((s) => s.hasLessonContext).length,
        sessionsWithoutContext: sessions.filter((s) => !s.hasLessonContext)
          .length,
        averageAge:
          sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.age, 0) / sessions.length
            : 0,
      },
    });
  });
}

// Clear all sessions endpoint (for testing)
export async function DELETE() {
  return apiHandler(async () => {
    const sessionStore = global.sessionStore;

    if (!sessionStore) {
      return ApiError.notFound("Session store not found");
    }

    const clearedCount = sessionStore.size;
    sessionStore.clear();

    return ApiSuccess.ok({
      message: `Cleared ${clearedCount} sessions`,
      clearedSessions: clearedCount,
    });
  });
}
