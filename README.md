# 📱 Smart University Attendance & Timetable App

A mobile application built with **React Native** and **Expo** that helps university students manage their class schedule, track attendance, view grades, and access academic documents — all in one place.

---

## 👥 Team Members

| Name | Student ID | Role |
|------|-----------|------|
| Amanullah Katpar | FA23-BSCS-0087 | Full-Stack Mobile Developer |
| Sateesh Kumar | FA23-BSCS-0087 | Full-Stack Mobile Developer |

> Both team members contributed equally to the project.

---

## 💡 Project Idea

### Problem Statement
MAJU students must use multiple platforms to check their timetable, attendance, grades, and fee information. The existing university mobile app lacks several key student-focused features such as real-time class detection, dark mode, notification controls, and privacy settings.

### Our Solution
A unified, student-centric mobile app that puts the most important academic information at your fingertips — with smart features the existing app does not have.

### Target Users
BS Computer Science students at Mohammad Ali Jinnah University (MAJU), Karachi, Pakistan.

### Motivation
As students ourselves, we experience this problem daily. We chose this idea to solve a real problem in our own university using the mobile development skills learned in this course.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Mobile Framework | React Native + Expo SDK 55 |
| Language | TypeScript |
| Navigation | Expo Router (file-based routing) |
| State Management | React Context API |
| Local Storage | AsyncStorage |
| UI Components | React Native core components |
| Platform Support | Android, iOS, Web |

---

## ⚙️ Project Feature Set

### Core Features
- **📅 Smart Timetable** — Weekly schedule with real-time LIVE class detection and countdown to next class
- **✅ Attendance Tracker** — Per-course attendance percentage with 75% warning threshold and history log
- **📊 Grades & GPA** — Course grades, assignment breakdown, and cumulative GPA overview
- **👤 Profile Management** — Editable name, email, and phone with persistent storage
- **🔐 Secure Login** — Student ID and password authentication

### Additional Features
- **🌙 Dark Mode** — App-wide theme toggle that persists across sessions
- **🔔 Notification Controls** — Toggle class reminders, early reminders, and attendance alerts
- **🔒 Privacy Settings** — Three modes: Attendance Only, Full Academic Record, Private
- **🧾 Fee Invoice** — Detailed semester fee voucher with student information
- **📄 Transcript Download** — Academic transcript with all course grades
- **📋 Copy to Clipboard** — Instantly copy transcript content
- **🚪 Logout** — Secure logout with confirmation

### Unique / Innovative Features
- Real-time **LIVE** class indicator — detects which class is happening right now
- **Countdown timer** to the next upcoming class
- **Privacy gate** — privacy setting actually controls what data screens display
- **Cross-platform alerts** — custom in-app modal system for web, native alerts for mobile
- Color-coded class types: Lecture, Lab, Tutorial, Seminar

---

## 🏗️ Application Architecture

```
SmartUniTimetable/
├── app/
│   ├── _layout.tsx              ← Root layout with AppProvider + Stack navigator
│   ├── login.tsx                ← Login screen with forgot password flow
│   ├── fee-invoice.tsx          ← Fee voucher screen
│   ├── context/
│   │   └── AppContext.tsx       ← Global state (profile, settings, privacy)
│   └── (tabs)/
│       ├── _layout.tsx          ← Bottom tab bar (5 tabs)
│       ├── index.tsx            ← Timetable screen
│       ├── attendance.tsx       ← Attendance screen
│       ├── courses.tsx          ← Courses screen
│       ├── explore.tsx          ← Grades screen
│       └── profile.tsx          ← Profile screen (edit, password, privacy, help)
├── assets/                      ← Images and fonts
├── package.json
└── app.json                     ← Expo configuration
```

---

## 📐 Technical Details

### State Management — Context API
Global state is managed using React's built-in Context API. The `AppContext` provides:
- `profile` — user name, email, phone (persisted via AsyncStorage)
- `settings` — darkMode, classReminders, earlyReminder, attendanceAlerts (persisted)
- `privacySetting` — controls data visibility across screens (persisted)

### Data Persistence — AsyncStorage
User data is saved locally on the device using `@react-native-async-storage/async-storage`. Data loads on app start via `useEffect` and saves on every change.

### Navigation — Expo Router
File-based routing where every file in `app/` becomes a route automatically. Route groups like `(tabs)` share layout without affecting the URL path.

### Authentication
Local credential validation for prototype. In production, this would connect to the university's REST API with JWT token authentication stored in Expo SecureStore.

### Cross-Platform Compatibility
`Platform.OS` checks ensure correct behavior on web and mobile:
- Alerts: custom modal on web, `Alert.alert()` on mobile
- Downloads: Blob API on web, `Share.share()` on mobile
- Notifications: Browser Notification API on web

### Design Patterns Used
- **Provider Pattern** — AppProvider wraps the entire app
- **Observer Pattern** — React state system re-renders all subscribers on change
- **Guard Clause Pattern** — Privacy gates check settings before rendering screens
- **Custom Hook Pattern** — `useTheme()`, `useAppContext()` for clean component code

---

## 🚀 How to Run the Project

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) app on your phone

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/SmartUniTimetable.git
cd SmartUniTimetable
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Install Expo packages
```bash
npx expo install @react-native-async-storage/async-storage expo-print expo-sharing expo-file-system
```

### Step 4 — Start the development server
```bash
npx expo start
```

### Step 5 — Open on your device
- **Android/iOS:** Scan the QR code with the Expo Go app
- **Web:** Press `w` in the terminal to open in browser
- **If phone and laptop are on different networks:** Use `npx expo start --tunnel`

### Login Credentials (for testing)
```
Student ID : fa23bscs0087
Password   : aman786?
```

---

## 📸 Screenshots

> Add screenshots of each screen here after taking them

| Login | Timetable | Attendance |
|-------|-----------|------------|
| ![Login](./assets/screenshots/login.png) | ![Timetable](./assets/screenshots/timetable.png) | ![Attendance](./assets/screenshots/attendance.png) |

| Grades | Profile | Fee Invoice |
|--------|---------|-------------|
| ![Grades](./assets/screenshots/grades.png) | ![Profile](./assets/screenshots/profile.png) | ![Fee](./assets/screenshots/fee.png) |

---

## 📦 Key Dependencies

```json
{
  "expo": "~55.0.0",
  "expo-router": "~55.0.14",
  "react": "19.2.0",
  "react-native": "0.83.6",
  "typescript": "^5.0.0",
  "@react-native-async-storage/async-storage": "latest",
  "expo-status-bar": "~2.0.1",
  "react-native-safe-area-context": "latest"
}
```

---

## 🎓 Course Information

- **Course:** Mobile Application Development (CS4401)
- **Instructor:** Muhammad Tahir Hassan
- **University:** Mohammad Ali Jinnah University, Karachi
- **Semester:** Spring 2025 (Semester 6)
- **Program:** BS (Hons) Computer Science

---

## 📝 Project Description

> *"For our semester project, we built a mobile app using React Native and Expo to help students easily check their class schedule, track attendance, view grades, and access course details — all in one app. We chose this idea because as students we always find it hard to keep track of everything separately. We used Expo Router for navigation and AsyncStorage to save data on the device. Our app adds features missing from the existing university app including real-time class detection, dark mode, notification controls, and privacy settings."*

---

## 📄 License

This project was built as a semester project for academic purposes at Mohammad Ali Jinnah University.
