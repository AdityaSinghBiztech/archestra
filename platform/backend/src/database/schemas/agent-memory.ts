import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import usersTable from "./user";
import { team } from "./team";
import organizationsTable from "./organization";

export const agentMemories = pgTable("agent_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  scope: text("scope", { enum: ["user", "team", "org"] }).notNull(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  teamId: text("team_id").references(() => team.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export default agentMemories;
