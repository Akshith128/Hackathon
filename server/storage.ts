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
  systemConfig,
  type Attendance,
  type InsertAttendance,
  type Syllabus,
  type InsertSyllabus,
  attendance,
  syllabus
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
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;

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

  // Attendance
  markAttendance(attendance: Omit<InsertAttendance, "id">): Promise<Attendance>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;

  // Syllabus
  getAllSyllabus(): Promise<Syllabus[]>;
  updateSyllabusStatus(id: string, status: string): Promise<Syllabus | undefined>;
  createSyllabusTopic(topic: Omit<InsertSyllabus, "id">): Promise<Syllabus>;
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

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
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

  // Stubs for new features (using MemStorage primarily)
  async markAttendance(attendance: Omit<InsertAttendance, "id">): Promise<Attendance> { throw new Error("Method not implemented."); }
  async getAttendanceByDate(date: string): Promise<Attendance[]> { throw new Error("Method not implemented."); }
  async getAllSyllabus(): Promise<Syllabus[]> { throw new Error("Method not implemented."); }
  async updateSyllabusStatus(id: string, status: string): Promise<Syllabus | undefined> { throw new Error("Method not implemented."); }
  async createSyllabusTopic(topic: Omit<InsertSyllabus, "id">): Promise<Syllabus> { throw new Error("Method not implemented."); }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private exams: Map<string, Exam>;
  private rooms: Map<string, Room>;
  private seatings: Map<string, Seating>;
  private seatingCharts: Map<string, SeatingChart>;
  private schedules: Map<string, Schedule>;
  private attendance: Map<string, Attendance>;
  private syllabus: Map<string, Syllabus>;
  private systemConfig: SystemConfig;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.exams = new Map();
    this.rooms = new Map();
    this.seatings = new Map();
    this.seatingCharts = new Map();
    this.schedules = new Map();
    this.attendance = new Map();
    this.syllabus = new Map();
    this.systemConfig = { id: "1", examMode: false, updatedAt: new Date() };

    // Seed Data
    this.seedData();
  }

  private seedData() {
    // Users
    const usersList: User[] = [
      { id: "R101", role: "student", password: "password", name: "Alex Johnson", department: "Computer Science", year: 3, dob: "01012000", club_name: null, academic_status: "active", additional_roles: [], designation: null, credits: 18, backlogs: 0 },
      { id: "A001", role: "admin", password: "password", name: "Administrator", department: null, year: null, dob: null, club_name: null, academic_status: "active", additional_roles: [], designation: null, credits: 0, backlogs: 0 },
      { id: "F001", role: "faculty", password: "password", name: "Dr. Smith", department: "Computer Science", year: null, dob: null, club_name: null, academic_status: "active", additional_roles: [], designation: "Professor", credits: 0, backlogs: 0 },
      // Add more students for seating algo
      ...Array.from({ length: 50 }).map((_, i) => ({
        id: `S${100 + i}`,
        role: "student",
        password: "password",
        name: `Student ${100 + i}`,
        department: "Computer Science",
        year: 3,
        dob: "01012000",
        club_name: null,
        academic_status: i % 10 === 0 ? "detained" : "active",
        additional_roles: [],
        designation: null,
        credits: 15 + (i % 5),
        backlogs: i % 10 === 0 ? 4 : 0
      } as User))
    ];
    usersList.forEach(u => this.users.set(u.id, u));

    // Rooms
    this.createRoom({ roomNumber: "304", capacity: 30, rows: 6, columns: 5, building: "Main Block" });
    this.createRoom({ roomNumber: "305", capacity: 30, rows: 6, columns: 5, building: "Main Block" });

    // Events
    this.createEvent({ title: "Hackathon 2025", description: "Annual coding competition", eventDate: "2025-12-25", startTime: "09:00", endTime: "18:00", venue: "Auditorium", department: "CS", status: "approved", createdBy: "A001" });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const direct = this.users.get(identifier);
    if (direct) return direct;
    // Case-insensitive fallback
    const lowerId = identifier.toLowerCase();
    for (const [key, user] of this.users.entries()) {
      if (key.toLowerCase() === lowerId) return user;
    }
    return undefined;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      credits: insertUser.credits ?? 0,
      backlogs: insertUser.backlogs ?? 0,
      department: insertUser.department ?? null,
      year: insertUser.year ?? null,
      dob: insertUser.dob ?? null,
      club_name: insertUser.club_name ?? null,
      academic_status: insertUser.academic_status ?? 'active',
      additional_roles: insertUser.additional_roles ?? null,
      designation: insertUser.designation ?? null
    };
    this.users.set(user.id, user);
    return user;
  }
  async getUsersByRole(role: string): Promise<User[]> { return Array.from(this.users.values()).filter(u => u.role === role); }
  async getAllUsers(): Promise<User[]> { return Array.from(this.users.values()); }
  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated as User); // brute force cast as safely merged
    return updated as User;
  }

  // Events
  async getAllEvents(): Promise<Event[]> { return Array.from(this.events.values()); }
  async getEventById(id: string): Promise<Event | undefined> { return this.events.get(id); }
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = Math.random().toString(36).substr(2, 9);
    const newEvent: Event = {
      ...event,
      id,
      createdAt: new Date(),
      description: event.description ?? null,
      startTime: event.startTime ?? null,
      endTime: event.endTime ?? null,
      venue: event.venue ?? null,
      createdBy: event.createdBy ?? null,
      status: event.status ?? 'pending'
    };
    this.events.set(id, newEvent);
    return newEvent;
  }
  async updateEventStatus(id: string, status: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updated = { ...event, status };
    this.events.set(id, updated);
    return updated;
  }
  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updated = { ...event, ...updates };
    this.events.set(id, updated as Event);
    return updated as Event;
  }
  async deleteEvent(id: string): Promise<void> { this.events.delete(id); }

  // Exams
  async getAllExams(): Promise<Exam[]> { return Array.from(this.exams.values()); }
  async getExamById(id: string): Promise<Exam | undefined> { return this.exams.get(id); }
  async createExam(exam: InsertExam): Promise<Exam> {
    const id = Math.random().toString(36).substr(2, 9);
    const newExam: Exam = { ...exam, id };
    this.exams.set(id, newExam);
    return newExam;
  }
  async getExamsByDepartment(department: string): Promise<Exam[]> { return Array.from(this.exams.values()).filter(e => e.department === department); }

  // Rooms
  async getAllRooms(): Promise<Room[]> { return Array.from(this.rooms.values()); }
  async getRoomById(id: string): Promise<Room | undefined> { return this.rooms.get(id); }
  async createRoom(room: InsertRoom): Promise<Room> {
    const id = Math.random().toString(36).substr(2, 9);
    const newRoom: Room = {
      ...room,
      id,
      building: room.building ?? null
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }
  async getRoomByNumber(roomNumber: string): Promise<Room | undefined> { return Array.from(this.rooms.values()).find(r => r.roomNumber === roomNumber); }

  // Seatings
  async getSeatingsForExam(examId: string): Promise<Seating[]> { return Array.from(this.seatings.values()).filter(s => s.examId === examId); }
  async getSeatingsForExamAndRoom(examId: string, roomId: string): Promise<Seating[]> { return Array.from(this.seatings.values()).filter(s => s.examId === examId && s.roomId === roomId); }
  async createSeating(seating: InsertSeating): Promise<Seating> {
    const id = Math.random().toString(36).substr(2, 9);
    const newSeating: Seating = {
      ...seating,
      id,
      createdAt: new Date(),
      examId: seating.examId ?? null,
      roomId: seating.roomId ?? null,
      studentId: seating.studentId ?? null
    };
    this.seatings.set(id, newSeating);
    return newSeating;
  }
  async getSeatingsForStudent(studentId: string): Promise<Seating[]> { return Array.from(this.seatings.values()).filter(s => s.studentId === studentId); }
  async deleteSeatingsByExamAndRoom(examId: string, roomId: string): Promise<void> {
    Array.from(this.seatings.keys()).forEach(key => {
      const val = this.seatings.get(key);
      if (val && val.examId === examId && val.roomId === roomId) this.seatings.delete(key);
    });
  }
  async deleteSeatingsByExam(examId: string): Promise<void> {
    Array.from(this.seatings.keys()).forEach(key => {
      const val = this.seatings.get(key);
      if (val && val.examId === examId) this.seatings.delete(key);
    });
  }

  // Seating Charts
  async getSeatingChart(examId: string, roomId: string): Promise<SeatingChart | undefined> { return Array.from(this.seatingCharts.values()).find(s => s.examId === examId && s.roomId === roomId); }
  async createSeatingChart(chart: InsertSeatingChart): Promise<SeatingChart> {
    const id = Math.random().toString(36).substr(2, 9);
    const newChart: SeatingChart = { ...chart, id, createdAt: new Date(), updatedAt: new Date() };
    this.seatingCharts.set(id, newChart);
    return newChart;
  }
  async updateSeatingChart(id: string, grid: string): Promise<SeatingChart | undefined> {
    const chart = this.seatingCharts.get(id);
    if (!chart) return undefined;
    const updated = { ...chart, grid, updatedAt: new Date() };
    this.seatingCharts.set(id, updated);
    return updated;
  }

  // Schedules
  async getSchedulesByDepartmentAndSemester(department: string, semester: number): Promise<Schedule[]> { return Array.from(this.schedules.values()).filter(s => s.department === department && s.semester === semester); }
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = Math.random().toString(36).substr(2, 9);
    const newSchedule = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  // Attendance
  async markAttendance(insertAttendance: Omit<InsertAttendance, "id">): Promise<Attendance> {
    const id = Math.random().toString(36).substr(2, 9);
    const newRecord: Attendance = { ...insertAttendance, id, courseId: insertAttendance.courseId || null };
    this.attendance.set(id, newRecord);
    return newRecord;
  }
  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(a => a.date === date);
  }

  // Syllabus
  async getAllSyllabus(): Promise<Syllabus[]> {
    return Array.from(this.syllabus.values());
  }
  async updateSyllabusStatus(id: string, status: string): Promise<Syllabus | undefined> {
    const item = this.syllabus.get(id);
    if (!item) return undefined;
    const updated = { ...item, status };
    this.syllabus.set(id, updated);
    return updated;
  }
  async createSyllabusTopic(topic: Omit<InsertSyllabus, "id">): Promise<Syllabus> {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem: Syllabus = { ...topic, id, status: topic.status || 'pending', totalUnits: topic.totalUnits || 1 };
    this.syllabus.set(id, newItem);
    return newItem;
  }


  // System Config
  async getSystemConfig(): Promise<SystemConfig | undefined> { return this.systemConfig; }
  async updateExamMode(examMode: boolean): Promise<SystemConfig> {
    this.systemConfig.examMode = examMode;
    this.systemConfig.updatedAt = new Date();
    return this.systemConfig;
  }
}

export const storage = new MemStorage();
