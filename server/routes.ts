import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertExamSchema, insertSeatingSchema, insertScheduleSchema, insertUserSchema, insertAttendanceSchema, insertSyllabusSchema } from "@shared/schema";
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

      console.log(`[LOGIN ATTEMPT] ID: ${id}, Role: ${role}, Password: ${password}`);
      const user = await storage.getUserByIdentifier(id);
      console.log(`[LOGIN RESULT] User found:`, user ? { id: user.id, role: user.role, pass: user.password } : "null");

      if (!user) {
        console.log(`[LOGIN ERROR] User not found`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Case-insensitive checks
      const isPasswordValid = user.password === password;
      const isRoleValid = user.role.toLowerCase() === role.toLowerCase();

      if (!isPasswordValid || !isRoleValid) {
        console.log(`[LOGIN ERROR] Mismatch - Pass: ${isPasswordValid}, Role: ${isRoleValid} (expected ${user.role}, got ${role})`);
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

      // Seed example exams if none exist
      if (allExams.length === 0) {
        await storage.createExam({
          subjectName: "Data Structures",
          subjectCode: "CS201",
          examDate: "2024-12-20",
          startTime: "09:00",
          endTime: "12:00",
          semester: 3,
          department: "Computer Science"
        });
        await storage.createExam({
          subjectName: "Thermodynamics",
          subjectCode: "ME301",
          examDate: "2024-12-21",
          startTime: "14:00",
          endTime: "17:00",
          semester: 5,
          department: "Mechanical Engineering"
        });
        await storage.createExam({
          subjectName: "Circuit Analysis",
          subjectCode: "EE202",
          examDate: "2024-12-22",
          startTime: "09:00",
          endTime: "12:00",
          semester: 4,
          department: "Electrical Engineering"
        });
        return res.json(await storage.getAllExams());
      }

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

      const { grid, seatings } = allocateSeatingWithConstraints(students, [room]);

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
        if (!seating.studentId) return;
        const student = studentMap.get(seating.studentId);
        if (student) {
          grid[seating.row][seating.column] = {
            studentId: student.id,
            studentName: student.name,
            rollNumber: student.id,
            department: student.department || "UNKNOWN",
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

  // =================== FACULTY SEATING ALGORITHM API ===================

  app.post("/api/faculty/seating-algo", async (req, res) => {
    try {
      // Get all students
      const allStudents = await storage.getAllUsers();
      // Get rooms (fetch actual rooms from storage)
      const allRooms = await storage.getAllRooms();

      if (allRooms.length === 0) {
        // Fallback or seed if no rooms exist
        await storage.createRoom({ roomNumber: "LH-101", capacity: 60, rows: 10, columns: 6, building: "Main Block" }); // Lecture Hall
        await storage.createRoom({ roomNumber: "LAB-201", capacity: 40, rows: 8, columns: 5, building: "Science Block" }); // Computer Lab
        await storage.createRoom({ roomNumber: "CONF-A", capacity: 20, rows: 4, columns: 5, building: "Admin Block" }); // Conference Room
        await storage.createRoom({ roomNumber: "304", capacity: 30, rows: 6, columns: 5, building: "Main Block" });
        await storage.createRoom({ roomNumber: "305", capacity: 30, rows: 6, columns: 5, building: "Main Block" });
      }

      const roomsToUse = await storage.getAllRooms();

      // Run Algorithm
      const result = allocateSeatingWithConstraints(allStudents, roomsToUse);

      const assignments = result.seatings.map(s => {
        const student = allStudents.find(u => u.id === s.studentId);
        const room = roomsToUse.find(r => r.id === s.roomId);
        return {
          rollNumber: s.studentId,
          name: student?.name || "Unknown",
          room: room?.roomNumber || "Unknown",
          seat: (s.row * 5) + s.column + 1 // approximated seat number
        };
      });

      res.json({
        success: true,
        totalStudents: result.stats.total,
        detainedStudents: allStudents.filter(s => s.role === 'student' && s.academic_status === 'detained').length,
        assignments: assignments
      });
    } catch (error) {
      console.error("Error in seating algorithm:", error);
      res.status(500).json({ error: "Failed to generate seating" });
    }
  });

  // =================== EVENT UPDATE API ===================
  app.patch("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body; // Title, description, etc.

      const updatedEvent = await storage.updateEvent(id, updates);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // =================== PROMOTION LOGIC API ===================
  app.post("/api/admin/evaluate-promotion", async (req, res) => {
    try {
      const students = await storage.getUsersByRole('student');
      let detainedCount = 0;
      let promotedCount = 0;

      for (const student of students) {
        const credits = student.credits || 0;
        const backlogs = student.backlogs || 0;
        let newStatus = 'active';

        // Logic: Detain if Backlogs > 3 OR Credits < 15
        if (backlogs > 3 || credits < 15) {
          newStatus = 'detained';
        }

        if (newStatus !== student.academic_status) {
          await storage.updateUser(student.id, { academic_status: newStatus });
        }

        if (newStatus === 'detained') detainedCount++;
        else promotedCount++;
      }

      res.json({
        success: true,
        message: "Promotion evaluation completed",
        detained: detainedCount,
        promoted: promotedCount
      });
    } catch (error) {
      console.error("Error predicting promotion:", error);
      res.status(500).json({ error: "Failed to run promotion logic" });
    }
  });

  // =================== ATTENDANCE API ===================
  app.post("/api/attendance", async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse(req.body);
      const record = await storage.markAttendance(data);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid attendance data: " + error });
    }
  });

  app.get("/api/attendance", async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });
    const records = await storage.getAttendanceByDate(String(date));
    res.json(records);
  });

  // =================== SYLLABUS API ===================
  app.get("/api/syllabus", async (req, res) => {
    const list = await storage.getAllSyllabus();
    res.json(list);
  });

  app.post("/api/syllabus", async (req, res) => {
    try {
      const data = insertSyllabusSchema.parse(req.body);
      const item = await storage.createSyllabusTopic(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid syllabus data" });
    }
  });

  app.patch("/api/syllabus/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await storage.updateSyllabusStatus(id, status);
    res.json(updated);
  });

  // =================== AI CHAT API ===================
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, role } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // 🔹 Basic intent handling (reliability boost)
      const clean = message.toLowerCase();

      if (clean.includes("hall ticket") || clean.includes("hallticket")) {
        return res.json({
          reply:
            "You can download your hall ticket from the Student Dashboard under the Hall Ticket section. It includes exam details and a QR code for verification."
        });
      }

      if (clean.includes("seating") || clean.includes("seat")) {
        return res.json({
          reply:
            "Seating allocation details are available in the Student Dashboard once published by the administration. Check the Seating Plan section."
        });
      }

      if (clean.includes("attendance")) {
        return res.json({
          reply:
            "Faculty can mark attendance through the Faculty Dashboard. Students can view their attendance records in their profile."
        });
      }

      // 🔹 Gemini API call
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        return res.json({
          reply:
            "I can help with hall tickets, exams, seating, events, and study support. Please configure the Gemini API key for enhanced responses."
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Campus AI, an assistant for an academic and examination management system called NEXUS.

Rules:
- Only answer about hall tickets, exams, seating, events, syllabus, attendance, or general academic queries
- Be short, clear, and helpful (max 2-3 sentences)
- If asked about unrelated topics, politely redirect to academic topics
- Use a friendly, professional tone

User question: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I can help with hall tickets, exams, seating, events, and study support. How can I assist you today?";

      return res.json({ reply });
    } catch (error) {
      console.error("Error in AI chat:", error);
      return res.json({
        reply:
          "I can help with hall tickets, exams, seating, events, and study support. How can I assist you today?"
      });
    }
  });

  return httpServer;
}
