import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'manager', 'employee']);
export const eventTypeEnum = pgEnum('event_type', ['meeting', 'task', 'reminder', 'vacation']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);
export const statusEnum = pgEnum('status', ['pending', 'in_progress', 'completed', 'cancelled']);

// Users/Employees table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('employee'),
  position: text('position'),
  department: text('department'),
  phone: text('phone'),
  avatar: text('avatar'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: statusEnum('status').notNull().default('pending'),
  priority: priorityEnum('priority').notNull().default('medium'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: integer('budget'),
  clientName: text('client_name'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Members (many-to-many relationship)
export const projectMembers = pgTable('project_members', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role'), // role in the project (e.g., "lead", "developer", "designer")
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

// Events/Meetings table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: eventTypeEnum('type').notNull().default('meeting'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: text('location'),
  isAllDay: boolean('is_all_day').notNull().default(false),
  priority: priorityEnum('priority').notNull().default('medium'),
  status: statusEnum('status').notNull().default('pending'),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Event Participants (many-to-many relationship)
export const eventParticipants = pgTable('event_participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull().default('pending'), // pending, accepted, declined
  notified: boolean('notified').notNull().default(false),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sentById: integer('sent_by_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'), // pending, accepted, declined
  message: text('message'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  projectMemberships: many(projectMembers),
  createdEvents: many(events),
  eventParticipations: many(eventParticipants),
  sentInvitations: many(invitations, { relationName: 'sentInvitations' }),
  receivedInvitations: many(invitations, { relationName: 'receivedInvitations' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
  members: many(projectMembers),
  events: many(events),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [events.projectId],
    references: [projects.id],
  }),
  participants: many(eventParticipants),
  invitations: many(invitations),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  event: one(events, {
    fields: [invitations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [invitations.userId],
    references: [users.id],
    relationName: 'receivedInvitations',
  }),
  sentBy: one(users, {
    fields: [invitations.sentById],
    references: [users.id],
    relationName: 'sentInvitations',
  }),
}));
