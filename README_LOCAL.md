# NEXUS - Academic & Examination Management System

A full-stack, role-based academic administration system with glassmorphic UI, built with React, Express, PostgreSQL, and Supabase.

## System Architecture

- **Frontend:** React 19 + Vite + TailwindCSS (Glassmorphism theme)
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Supabase
- **ORM:** Drizzle ORM with Zod validation
- **Authentication:** Role-based access (Student, Faculty, Admin)

## Features

### Student Dashboard
- 🎓 **Smart Syllabus** - Mind map visualization of course structure
- 🎫 **Hall Tickets** - Download examination tickets with QR codes
- 📋 **Seating Plans** - View assigned exam seating
- 📅 **Live Ticker** - Real-time campus announcements

### Faculty Dashboard
- 📊 **Attendance Management** - Mark and track attendance
- 🪑 **Seating Algorithm** - Automatic intelligent seat allocation
  - Filters out detained students automatically
  - Allocates across multiple exam rooms
  - Color-coded by department
- 👥 **Student Mentorship** - Track assigned students

### Admin Dashboard
- 👤 **User Management** - Manage students, faculty, admin roles
- 📤 **Bulk Hall Ticket Upload** - Drag-and-drop PDF upload
  - Regex-based roll number extraction
  - Automatic student verification
- 🔧 **System Configuration** - One-click exam mode activation
- 📊 **Reports & Analytics** - System activity logs and metrics

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available at supabase.com)

### Installation

1. **Clone or extract the repository**
   ```bash
   # Navigate to project directory
   cd nexus-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   NODE_ENV=development
   ```
   
   **Getting Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create a free account and new project
   - Copy the Project URL and Anon Key from Settings > API
   - Paste them into `.env.local`

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at: `http://localhost:5000`

## Login Credentials (Demo)

Use these test credentials to explore the system:

### Student Login
- **ID:** R101
- **Password:** 10011995

### Faculty Login
- **ID:** F001
- **Password:** 05051990

### Admin Login
- **ID:** A001
- **Password:** 01011985

## Project Structure

```
nexus-project/
├── client/src/
│   ├── pages/
│   │   ├── student/
│   │   │   └── Dashboard.tsx (Student interface)
│   │   ├── faculty/
│   │   │   ├── Dashboard.tsx (Faculty interface)
│   │   │   └── SeatingAlgorithm.tsx (Seat allocation tool)
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx (Admin overview)
│   │   │   ├── BulkUpload.tsx (Hall ticket uploader)
│   │   │   └── UserManagement.tsx (User CRUD)
│   │   └── Login.tsx (Authentication)
│   ├── components/
│   │   ├── MainLayout.tsx (Primary wrapper)
│   │   ├── CardNav.tsx (Navigation system)
│   │   └── ui/ (shadcn components)
│   └── supabaseClient.ts (Database connection)
├── server/
│   ├── routes.ts (API endpoints)
│   └── storage.ts (Data persistence layer)
├── shared/
│   └── schema.ts (Data models & Zod validation)
└── package.json
```

## API Endpoints

### Admin APIs
- `POST /api/admin/bulk-upload` - Process hall ticket PDFs
- `PATCH /api/admin/users/:id` - Update user detention status

### Faculty APIs
- `POST /api/faculty/seating-algo` - Generate seating allocation
- `GET /api/students` - Fetch all students

### System APIs
- `GET /api/config/exam-mode` - Check exam mode status
- `PATCH /api/config/exam-mode` - Toggle exam mode

## Features in Detail

### Bulk Upload (Admin Feature)
1. Navigate to Admin Dashboard → "Bulk Upload"
2. Drag and drop PDF files named like: `R101.pdf`, `R102.pdf` (Roll numbers as filenames)
3. System extracts roll numbers using regex
4. Verifies student exists in database
5. Updates their hall ticket status

### Seating Algorithm (Faculty Feature)
1. Navigate to Faculty Dashboard → "Seating Algorithm"
2. Click "Generate Seating"
3. Algorithm automatically:
   - Filters out students with "Detained" status
   - Allocates across 4 examination rooms (30 seats each)
   - Returns JSON with room and seat assignments

### Exam Mode (Admin Feature)
1. In Admin Dashboard, toggle "One-Click Exam Mode"
2. When active:
   - Students see urgent hall ticket download button
   - Non-essential modules are hidden
   - System shows in red with pulsing animation

## Database Schema

Key tables:
- **users** - Students, Faculty, Admin with roles
- **exams** - Exam schedules and details
- **rooms** - Examination halls with capacity
- **seatings** - Individual seat allocations
- **events** - Club activities and campus events
- **system_config** - Global system settings

## Theme & Design

The system features:
- **Glassmorphism UI** - Frosted glass effect with backdrop blur
- **Dark Mode** - Executive dark theme (bg-slate-950)
- **Smooth Animations** - Framer Motion transitions
- **Responsive Layout** - Mobile to desktop optimization
- **Color-Coded Departments** - Easy visual distinction

## Troubleshooting

### Supabase Connection Issues
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Ensure ANON_KEY has proper permissions

### Bulk Upload Not Working
- Check PDF filename format (e.g., `R101.pdf`)
- Ensure student exists in database
- Check browser console for detailed errors

### Seating Algorithm Returns Empty
- Verify students exist in database
- Check at least some students have `academic_status = 'active'`
- Ensure rooms are created in database

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use different port
PORT=3000 npm run dev
```

## Development Commands

```bash
# Start dev server (frontend + backend)
npm run dev

# Build for production
npm run build

# Database migration (if using Drizzle)
npm run db:push

# Run database studio
npm run db:studio
```

## Deployment

The project is ready for deployment on:
- **Vercel** (Frontend + Backend)
- **Railway** (Full Stack)
- **Render** (Full Stack)
- **Replit** (Native support)

Environment variables must be set in your deployment platform.

## Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **TailwindCSS:** https://tailwindcss.com
- **Drizzle ORM:** https://orm.drizzle.team

## License

MIT License - Feel free to use this project for educational purposes.

---

**Built with ❤️ using React, Express, and Supabase**
