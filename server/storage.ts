import { 
  type User, 
  type InsertUser,
  type Event,
  type InsertEvent,
  type Exam,
  type InsertExam,
  type Room,
  type InsertRoom,
  type Seating,
  type InsertSeating,
  type SeatingChart,
  type InsertSeatingChart,
  type Schedule,
  type InsertSchedule,
  type SystemConfig,
  users,
  events,
  exams,
  rooms,
  seatings,
  seatingChart,
  schedules,
  systemConfig
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEventStatus(id: string, status: string): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Exams
  getAllExams(): Promise<Exam[]>;
  getExamById(id: string): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  getExamsByDepartment(department: string): Promise<Exam[]>;
  
  // Rooms
  getAllRooms(): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByNumber(roomNumber: string): Promise<Room | undefined>;
  
  // Seatings
  getSeatingsForExam(examId: string): Promise<Seating[]>;
  getSeatingsForExamAndRoom(examId: string, roomId: string): Promise<Seating[]>;
  createSeating(seating: InsertSeating): Promise<Seating>;
  getSeatingsForStudent(studentId: string): Promise<Seating[]>;
  deleteSeatingsByExamAndRoom(examId: string, roomId: string): Promise<void>;
  deleteSeatingsByExam(examId: string): Promise<void>;
  
  // Seating Charts
  getSeatingChart(examId: string, roomId: string): Promise<SeatingChart | undefined>;
  createSeatingChart(chart: InsertSeatingChart): Promise<SeatingChart>;
  updateSeatingChart(id: string, grid: string): Promise<SeatingChart | undefined>;
  
  // Schedules
  getSchedulesByDepartmentAndSemester(department: string, semester: number): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  
  // System Config
  getSystemConfig(): Promise<SystemConfig | undefined>;
  updateExamMode(examMode: boolean): Promise<SystemConfig>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, identifier)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEventStatus(id: string, status: string): Promise<Event | undefined> {
    const result = await db.update(events).set({ status }).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Exams
  async getAllExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(exams.examDate);
  }

  async getExamById(id: string): Promise<Exam | undefined> {
    const result = await db.select().from(exams).where(eq(exams.id, id)).limit(1);
    return result[0];
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const result = await db.insert(exams).values(exam).returning();
    return result[0];
  }

  async getExamsByDepartment(department: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.department, department));
  }

  // Rooms
  async getAllRooms(): Promise<Room[]> {
    return await db.select().from(rooms);
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    return result[0];
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const result = await db.insert(rooms).values(room).returning();
    return result[0];
  }

  async getRoomByNumber(roomNumber: string): Promise<Room | undefined> {
    const result = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNumber)).limit(1);
    return result[0];
  }

  // Seatings
  async getSeatingsForExam(examId: string): Promise<Seating[]> {
    return await db.select().from(seatings).where(eq(seatings.examId, examId));
  }

  async getSeatingsForExamAndRoom(examId: string, roomId: string): Promise<Seating[]> {
    return await db.select().from(seatings).where(
      and(eq(seatings.examId, examId), eq(seatings.roomId, roomId))
    );
  }

  async createSeating(seating: InsertSeating): Promise<Seating> {
    const result = await db.insert(seatings).values(seating).returning();
    return result[0];
  }

  async getSeatingsForStudent(studentId: string): Promise<Seating[]> {
    return await db.select().from(seatings).where(eq(seatings.studentId, studentId));
  }

  async deleteSeatingsByExamAndRoom(examId: string, roomId: string): Promise<void> {
    await db.delete(seatings).where(
      and(eq(seatings.examId, examId), eq(seatings.roomId, roomId))
    );
  }

  async deleteSeatingsByExam(examId: string): Promise<void> {
    await db.delete(seatings).where(eq(seatings.examId, examId));
  }

  // Seating Charts
  async getSeatingChart(examId: string, roomId: string): Promise<SeatingChart | undefined> {
    const result = await db.select().from(seatingChart).where(
      and(eq(seatingChart.examId, examId), eq(seatingChart.roomId, roomId))
    ).limit(1);
    return result[0];
  }

  async createSeatingChart(chart: InsertSeatingChart): Promise<SeatingChart> {
    const result = await db.insert(seatingChart).values(chart).returning();
    return result[0];
  }

  async updateSeatingChart(id: string, grid: string): Promise<SeatingChart | undefined> {
    const result = await db.update(seatingChart)
      .set({ grid, updatedAt: new Date() })
      .where(eq(seatingChart.id, id))
      .returning();
    return result[0];
  }

  // Schedules
  async getSchedulesByDepartmentAndSemester(department: string, semester: number): Promise<Schedule[]> {
    return await db.select().from(schedules).where(
      and(eq(schedules.department, department), eq(schedules.semester, semester))
    );
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schedules).values(schedule).returning();
    return result[0];
  }

  // System Config
  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const result = await db.select().from(systemConfig).limit(1);
    if (result.length === 0) {
      const init = await db.insert(systemConfig).values({ examMode: false }).returning();
      return init[0];
    }
    return result[0];
  }

  async updateExamMode(examMode: boolean): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    if (config) {
      const result = await db.update(systemConfig)
        .set({ examMode, updatedAt: new Date() })
        .where(eq(systemConfig.id, config.id))
        .returning();
      return result[0];
    }
    const result = await db.insert(systemConfig).values({ examMode }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
