import { and, eq, inArray, or } from "drizzle-orm";
import db, { schema } from "@/database";

export class AgentMemoryModel {
  static async findActiveMemories(params: {
    organizationId: string;
    userId: string;
    teamIds: string[];
  }) {
    const conditions = [
      eq(schema.agentMemoriesTable.scope, "org"),
      and(
        eq(schema.agentMemoriesTable.scope, "user"),
        eq(schema.agentMemoriesTable.userId, params.userId)
      ),
    ];

    if (params.teamIds.length > 0) {
      conditions.push(
        and(
          eq(schema.agentMemoriesTable.scope, "team"),
          inArray(schema.agentMemoriesTable.teamId, params.teamIds)
        )
      );
    }

    return db
      .select()
      .from(schema.agentMemoriesTable)
      .where(
        and(
          eq(schema.agentMemoriesTable.organizationId, params.organizationId),
          or(...conditions)
        )
      );
  }

  static async store(data: typeof schema.agentMemoriesTable.$inferInsert) {
    return db.insert(schema.agentMemoriesTable).values(data).returning();
  }

  static async delete(id: string) {
    return db.delete(schema.agentMemoriesTable).where(eq(schema.agentMemoriesTable.id, id));
  }
}

export default AgentMemoryModel;
