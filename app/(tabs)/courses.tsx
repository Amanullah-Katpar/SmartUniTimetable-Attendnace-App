import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/AppContext";

type CourseType = "Core" | "Elective";
interface Course { code: string; name: string; credits: number; grade: string; gradeVariant: "green" | "blue" | "amber"; lecturer: string; sessions: string; progress: number; nextDeadline: string; description: string; type: CourseType; }

const COURSES: Course[] = [
  { code: "CS301", name: "Algorithms & Data Structures", credits: 15, grade: "A−", gradeVariant: "green", lecturer: "Dr. Imran Malik", sessions: "3 per week", progress: 72, nextDeadline: "Assignment 3 — May 18", description: "Covers sorting, graph algorithms, dynamic programming and complexity analysis.", type: "Core" },
  { code: "CS315", name: "Database Systems", credits: 12, grade: "B+", gradeVariant: "blue", lecturer: "Dr. Sara Qureshi", sessions: "2 per week + lab", progress: 60, nextDeadline: "Lab report — May 20", description: "Relational databases, SQL, normalisation, transactions and NoSQL systems.", type: "Core" },
  { code: "CS322", name: "Operating Systems", credits: 12, grade: "B", gradeVariant: "blue", lecturer: "Prof. Khalid Raza", sessions: "2 per week + lab", progress: 55, nextDeadline: "Midterm — May 22", description: "Process management, memory, file systems, concurrency and scheduling.", type: "Core" },
  { code: "CS330", name: "Software Engineering", credits: 12, grade: "A", gradeVariant: "green", lecturer: "Dr. Amina Farooq", sessions: "2 per week + seminar", progress: 80, nextDeadline: "Sprint review — May 19", description: "Agile methods, design patterns, testing, CI/CD and project management.", type: "Core" },
  { code: "MA201", name: "Calculus II", credits: 12, grade: "B−", gradeVariant: "amber", lecturer: "Dr. Zara Ahmed", sessions: "2 per week + tutorial", progress: 58, nextDeadline: "Problem set 4 — May 17", description: "Integration techniques, series, multivariable calculus and differential equations.", type: "Elective" },
  { code: "EN210", name: "Technical Writing", credits: 9, grade: "A−", gradeVariant: "green", lecturer: "Ms. Nadia Hussain", sessions: "1 per week", progress: 70, nextDeadline: "Essay draft — May 24", description: "Academic and professional writing, documentation, presentations and editing.", type: "Elective" },
];

function gradeColors(v: Course["gradeVariant"]) {
  switch (v) {
    case "green": return { bg: "#E1F5EE", text: "#085041" };
    case "blue": return { bg: "#E6F1FB", text: "#0C447C" };
    case "amber": return { bg: "#FAEEDA", text: "#633806" };
  }
}

function CourseCard({ course, colors }: { course: Course; colors: any }) {
  const [expanded, setExpanded] = useState(false);
  const gc = gradeColors(course.gradeVariant);
  const C = colors;
  return (
    <View style={[styles.card, { borderColor: C.border, backgroundColor: C.bgCard }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          <Text style={[styles.courseName, { color: C.text }]}>{course.name}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.courseCode, { color: C.textSecondary }]}>{course.code}</Text>
            <View style={[styles.typeBadge, course.type === "Core" ? styles.typeBadgeCore : styles.typeBadgeElective]}>
              <Text style={[styles.typeBadgeText, course.type === "Core" ? styles.typeBadgeCoreText : styles.typeBadgeElectiveText]}>{course.type}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.chevron, { color: C.textMuted }]}>{expanded ? "▲" : "▼"}</Text>
          <View style={[styles.gradePill, { backgroundColor: gc.bg }]}><Text style={[styles.gradeText, { color: gc.text }]}>{course.grade}</Text></View>
          <Text style={[styles.credits, { color: C.textMuted }]}>{course.credits} cr</Text>
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.cardDetail, { borderTopColor: C.border }]}>
          <Text style={[styles.description, { color: C.textSecondary }]}>{course.description}</Text>
          <TouchableOpacity style={[styles.detailRow, { borderBottomColor: C.border }]} onPress={() => Alert.alert("Contact lecturer", `${course.lecturer}\n\nWould you like to send an email?`, [{ text: "Cancel", style: "cancel" }, { text: "Send email", onPress: () => Alert.alert("Opening mail...") }])}>
            <Text style={[styles.detailKey, { color: C.textSecondary }]}>Lecturer</Text>
            <Text style={[styles.detailVal, { color: C.purple }]}>{course.lecturer} ›</Text>
          </TouchableOpacity>
          <View style={[styles.detailRow, { borderBottomColor: C.border }]}>
            <Text style={[styles.detailKey, { color: C.textSecondary }]}>Sessions</Text>
            <Text style={[styles.detailVal, { color: C.text }]}>{course.sessions}</Text>
          </View>
          <TouchableOpacity style={[styles.detailRow, styles.detailRowLast]} onPress={() => Alert.alert("Upcoming deadline", `${course.nextDeadline}\n\nCourse: ${course.name} (${course.code})`)}>
            <Text style={[styles.detailKey, { color: C.textSecondary }]}>Next due</Text>
            <Text style={[styles.detailVal, { color: "#BA7517" }]}>{course.nextDeadline} ›</Text>
          </TouchableOpacity>
          <View style={[styles.progressTrack, { backgroundColor: C.bgSecondary }]}>
            <View style={[styles.progressFill, { width: `${course.progress}%` as any }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: C.textMuted }]}>Module progress</Text>
            <Text style={[styles.progressLabel, { color: C.textMuted }]}>{course.progress}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function CoursesScreen() {
  const { colors, dark } = useTheme();
  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const C = colors;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>My courses</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>Semester 2 · 2025–26</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsGrid, { borderBottomColor: C.border }]}>
          {[["Modules", String(COURSES.length)], ["Credits", String(totalCredits)], ["Avg grade", "B+"], ["Progress", "64%"]].map(([label, val]) => (
            <View key={label} style={[styles.statCard, { backgroundColor: C.bgSecondary }]}>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
              <Text style={[styles.statValue, { color: C.text }]}>{val}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Enrolled modules</Text>
        {COURSES.map(course => <CourseCard key={course.code} course={course} colors={C} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = "#534AB7";
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: "500" },
  headerSub: { fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16, borderBottomWidth: 0.5 },
  statCard: { flex: 1, minWidth: "45%", borderRadius: 8, padding: 12 },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "500" },
  sectionLabel: { fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  cardHeader: { padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardLeft: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: "500", marginBottom: 4, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  courseCode: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeBadgeCore: { backgroundColor: "#EEEDFE" },
  typeBadgeElective: { backgroundColor: "#FAEEDA" },
  typeBadgeText: { fontSize: 11, fontWeight: "500" },
  typeBadgeCoreText: { color: "#3C3489" },
  typeBadgeElectiveText: { color: "#633806" },
  cardRight: { alignItems: "flex-end", gap: 6 },
  chevron: { fontSize: 10 },
  gradePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  gradeText: { fontSize: 11, fontWeight: "500" },
  credits: { fontSize: 11 },
  cardDetail: { borderTopWidth: 0.5, padding: 14 },
  description: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 0.5 },
  detailRowLast: { borderBottomWidth: 0 },
  detailKey: { fontSize: 13 },
  detailVal: { fontSize: 13, fontWeight: "500" },
  purple: { color: PURPLE },
  progressTrack: { height: 5, borderRadius: 3, marginTop: 12, marginBottom: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PURPLE, borderRadius: 3 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11 },
});
