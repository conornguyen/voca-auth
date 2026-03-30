import { pgTable, uuid, varchar, timestamp, pgEnum, primaryKey, jsonb } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["Admin", "Owner", "Manager", "Staff", "Customer"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  billingPlan: varchar("billing_plan", { length: 50 }).notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantUsers = pgTable("tenant_users", {
  userId: uuid("user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  role: rolesEnum("role").notNull().default("Customer"),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.tenantId] }),
}));

export const outboxStatusEnum = pgEnum("outbox_status", ["pending", "published", "failed"]);

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull(),
  status: outboxStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
