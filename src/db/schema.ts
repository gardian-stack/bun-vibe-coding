import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { sql, relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  token: varchar("token", { length: 255 }).notNull(),
  expired_at: timestamp("expired_at").notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));
