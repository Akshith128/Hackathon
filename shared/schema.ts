import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // identifier (Roll No, Admin ID, Faculty ID, Student ID)
  role: text("role").notNull(), // Student, Admin, SeatingManager, ClubCoordinator
  password: text("password").notNull(), // Plain text password (DDMMYYYY format for DOB-based)
  name: text("name").notNull(),
  department: text("department"), // For students
  year: integer("year"), // For students (1, 2, 3, 4)
  dob: text("dob"), // DDMMYYYY format
  club_name: text("club_name"), // For club coordinators
  academic_status: text("academic_status").default('active'), // active, detained
  additional_roles: text("additional_roles").array(), // seating_manager, club_coordinator
  designation: text("designation"), // For faculty
});

// Events/Club activities
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  venue: text("venue"),
  department: text("department").notNull(),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Exams
export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectName: text("subject_name").notNull(),
  subjectCode: text("subject_code").notNull(),
  examDate: date("exam_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  semester: integer("semester").notNull(),
  department: text("department").notNull(),
});

// Examination Rooms
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomNumber: text("room_number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  rows: integer("rows").notNull(),
  columns: integer("columns").notNull(),
  building: text("building"),
});

// Seating Chart (stores complete allocation for an exam in a room)
export const seatingChart = pgTable("seating_chart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull().references(() => exams.id),
  roomId: varchar("room_id").notNull().references(() => rooms.id),
  grid: text("grid").notNull(), // JSON string of the seating grid
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Seating Allocations (individual student seat assignments)
export const seatings = pgTable("seatings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id),
  roomId: varchar("room_id").references(() => rooms.id),
  studentId: varchar("student_id").references(() => users.id),
  row: integer("row").notNull(),
  column: integer("column").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Class Schedule
export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectName: text("subject_name").notNull(),
  room: text("room").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  semester: integer("semester").notNull(),
  department: text("department").notNull(),
});

// System Config (for exam mode toggle)
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examMode: boolean("exam_mode").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({ 
  id: true, 
  role: true, 
  password: true, 
  name: true, 
  department: true, 
  year: true, 
  dob: true, 
  club_name: true, 
  academic_status: true, 
  additional_roles: true, 
  designation: true 
}).required({ id: true, role: true, password: true, name: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertSeatingSchema = createInsertSchema(seatings).omit({ id: true, createdAt: true });
export const insertSeatingChartSchema = createInsertSchema(seatingChart).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertSeating = z.infer<typeof insertSeatingSchema>;
export type Seating = typeof seatings.$inferSelect;

export type InsertSeatingChart = z.infer<typeof insertSeatingChartSchema>;
export type SeatingChart = typeof seatingChart.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export type SystemConfig = typeof systemConfig.$inferSelect;
