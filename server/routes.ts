import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertExamSchema, insertSeatingSchema, insertScheduleSchema, insertUserSchema } from "@shared/schema";
import { allocateSeatingWithConstraints } from "./seatingAlgorithm";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // =================== AUTH API ===================
  
  app.post("/api/login", async (req, res) => {
    try {
      const { id, password, role } = req.body;
      
      if (!id || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserByIdentifier(id);
      
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // =================== EVENTS API ===================
  
  app.get("/api/events", async (req, res) => {
    try {
      const allEvents = await storage.getAllEvents();
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(validatedData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  app.patch("/api/events/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedEvent = await storage.updateEventStatus(id, status);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event status:", error);
      res.status(500).json({ error: "Failed to update event status" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // =================== EXAMS API ===================
  
  app.get("/api/exams", async (req, res) => {
    try {
      const allExams = await storage.getAllExams();
      res.json(allExams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.post("/api/exams", async (req, res) => {
    try {
      const validatedData = insertExamSchema.parse(req.body);
      const newExam = await storage.createExam(validatedData);
      res.status(201).json(newExam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating exam:", error);
        res.status(500).json({ error: "Failed to create exam" });
      }
    }
  });

  // =================== ROOMS API ===================
  
  app.get("/api/rooms", async (req, res) => {
    try {
      const allRooms = await storage.getAllRooms();
      res.json(allRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = z.object({
        roomNumber: z.string(),
        capacity: z.number(),
        rows: z.number(),
        columns: z.number(),
        building: z.string().optional(),
      }).parse(req.body);
      const newRoom = await storage.createRoom(validatedData);
      res.status(201).json(newRoom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating room:", error);
        res.status(500).json({ error: "Failed to create room" });
      }
    }
  });

  // =================== SMART SEATING ALLOCATION ===================
  
  app.post("/api/seatings/allocate-smart", async (req, res) => {
    try {
      const { examId, roomId } = req.body;
      
      if (!examId || !roomId) {
        return res.status(400).json({ error: "examId and roomId are required" });
      }

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const students = await storage.getUsersByRole('student');
      if (students.length === 0) {
        return res.status(400).json({ error: "No students found" });
      }

      await storage.deleteSeatingsByExamAndRoom(examId, roomId);

      const { grid, seatings } = allocateSeatingWithConstraints(students, room);

      const savedSeatings = await Promise.all(
        seatings.map((seating) =>
          storage.createSeating({
            examId,
            roomId,
            studentId: seating.studentId,
            row: seating.row,
            column: seating.column,
          })
        )
      );

      res.status(201).json({
        message: "Smart seating allocation completed",
        count: savedSeatings.length,
        grid: grid.map((r) =>
          r.map((cell) => ({
            studentId: cell.studentId,
            role: cell.role,
          }))
        ),
        seatings: savedSeatings,
      });
    } catch (error) {
      console.error("Error allocating seating:", error);
      res.status(500).json({ error: "Failed to allocate seating" });
    }
  });

  app.get("/api/seatings/grid/:examId/:roomId", async (req, res) => {
    try {
      const { examId, roomId } = req.params;

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const seatings = await storage.getSeatingsForExamAndRoom(examId, roomId);
      const students = await storage.getUsersByRole('student');
      const studentMap = new Map(students.map((s) => [s.id, s]));

      const grid = Array(room.rows)
        .fill(null)
        .map(() => Array(room.columns).fill(null));

      seatings.forEach((seating) => {
        const student = studentMap.get(seating.studentId);
        if (student) {
          grid[seating.row][seating.column] = {
            studentId: student.id,
            studentName: student.name,
            rollNumber: student.id,
            department: student.department ?? "UNKNOWN",
          };
        }
      });

      res.json({
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          rows: room.rows,
          columns: room.columns,
          capacity: room.capacity,
        },
        grid,
        totalSeated: seatings.length,
      });
    } catch (error) {
      console.error("Error fetching seating grid:", error);
      res.status(500).json({ error: "Failed to fetch seating grid" });
    }
  });

  // =================== SYSTEM CONFIG API ===================
  
  app.get("/api/config/exam-mode", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      res.json({ examMode: config?.examMode || false });
    } catch (error) {
      console.error("Error fetching exam mode:", error);
      res.status(500).json({ error: "Failed to fetch exam mode" });
    }
  });

  app.patch("/api/config/exam-mode", async (req, res) => {
    try {
      const { examMode } = req.body;
      
      if (typeof examMode !== 'boolean') {
        return res.status(400).json({ error: "examMode must be a boolean" });
      }
      
      const updatedConfig = await storage.updateExamMode(examMode);
      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating exam mode:", error);
      res.status(500).json({ error: "Failed to update exam mode" });
    }
  });

  // =================== USERS/STUDENTS API ===================
  
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getUsersByRole('student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // =================== ADMIN BULK UPLOAD API ===================
  
  app.post("/api/admin/bulk-upload", async (req, res) => {
    try {
      const { rollNumber, filename } = req.body;
      
      if (!rollNumber || !filename) {
        return res.status(400).json({ error: "Missing rollNumber or filename" });
      }

      // Verify student exists
      const student = await storage.getUserByIdentifier(rollNumber);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({ 
        success: true, 
        message: "Hall ticket processed successfully",
        rollNumber,
        filename,
        studentName: student.name
      });
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({ error: "Failed to process bulk upload" });
    }
  });

  // =================== FACULTY SEATING ALGORITHM API ===================
  
  app.post("/api/faculty/seating-algo", async (req, res) => {
    try {
      // Get all students
      const allStudents = await storage.getUsersByRole('student');
      
      // Filter out detained students
      const activeStudents = allStudents.filter((s: any) => s.academic_status !== 'Detained');
      
      // Simple random seating assignment
      const rooms = ['Room A', 'Room B', 'Room C', 'Room D'];
      const seatsPerRoom = 30;
      
      const assignments = activeStudents.map((student: any, index: number) => {
        const roomIndex = Math.floor(index / seatsPerRoom) % rooms.length;
        const seatNumber = (index % seatsPerRoom) + 1;
        
        return {
          rollNumber: student.id,
          name: student.name || `Student ${student.id}`,
          room: rooms[roomIndex],
          seat: seatNumber
        };
      });

      res.json({
        success: true,
        totalStudents: allStudents.length,
        detainedStudents: allStudents.filter((s: any) => s.academic_status === 'Detained').length,
        assignments
      });
    } catch (error) {
      console.error("Error in seating algorithm:", error);
      res.status(500).json({ error: "Failed to generate seating" });
    }
  });

  return httpServer;
}
