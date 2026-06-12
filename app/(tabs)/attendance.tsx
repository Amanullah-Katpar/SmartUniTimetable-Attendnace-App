import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext, useTheme } from "../context/AppContext";

type AttendanceStatus = "present" | "absent" | "late" | "excused";
type FilterType = "all" | AttendanceStatus;

interface AttendanceRecord {
  id: number;
  date: string;
  courseName: string;
  courseCode: string;
  status: AttendanceStatus;
  time: string;
}

interface CourseSummary {
  code: string;
  name: string;
  total: number;
  present: number;
  color: string;
}

const COURSE_SUMMARIES: CourseSummary[] = [
  { code: "CS301", name: "Algorithms & DS", total: 24, present: 22, color: "#534AB7" },
  { code: "CS315", name: "Database Systems", total: 20, present: 17, color: "#1D9E75" },
  { code: "CS322", name: "Operating Systems", total: 18, present: 14, color: "#D85A30" },
  { code: "CS330", name: "Software Engineering", total: 16, present: 16, color: "#185FA5" },
  { code: "MA201", name: "Calculus II", total: 20, present: 15, color: "#BA7517" },
  { code: "EN210", name: "Technical Writing", total: 10, present: 9, color: "#993556" },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: 1, date: "Mon, 13 May", courseName: "Algorithms & Data Structures", courseCode: "CS301", status: "present", time: "09:00" },
  { id: 2, date: "Mon, 13 May", courseName: "Database Systems Lab", courseCode: "CS315", status: "present", time: "11:00" },
  { id: 3, date: "Fri, 10 May", courseName: "Operating Systems Lab", courseCode: "CS322", status: "late", time: "09:00" },
  { id: 4, date: "Thu, 9 May", courseName: "Calculus II", courseCode: "MA201", status: "absent", time: "10:00" },
  { id: 5, date: "Wed, 8 May", courseName: "Algorithms & Data Structures", courseCode: "CS301", status: "present", time: "09:00" },
  { id: 6, date: "Tue, 7 May", courseName: "Technical Writing", courseCode: "EN210", status: "present", time: "15:00" },
  { id: 7, date: "Mon, 6 May", courseName: "Software Engineering", courseCode: "CS330", status: "excused", time: "14:00" },
];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string }> = {
  present: { label: "Present", bg: "#E1F5EE", text: "#085041", dot: "#1D9E75" },
  absent:  { label: "Absent",  bg: "#FCEBEB", text: "#791F1F", dot: "#E24B4A" },
  late:    { label: "Late",    bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
  excused: { label: "Excused", bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
};

export default function AttendanceScreen() {
  const { colors, dark } = useTheme();
  const { privacySetting } = useAppContext();
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const C = colors;

  const totalClasses = records.length;
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const lateCount = records.filter(r => r.status === "late").length;
  const overallPct = Math.round((presentCount / totalClasses) * 100);
  const filteredRecords = filter === "all" ? records : records.filter(r => r.status === filter);

  function handleRecordPress(record: AttendanceRecord) {
    const cfg = STATUS_CONFIG[record.status];
    Alert.alert(record.courseName, `Date: ${record.date}\nTime: ${record.time}\nStatus: ${cfg.label}\nCourse: ${record.courseCode}`, [{ text: "OK" }]);
  }

  function handleCoursePress(course: CourseSummary) {
    const pct = Math.round((course.present / course.total) * 100);
    Alert.alert(course.name, `Attended: ${course.present}/${course.total} classes\nPercentage: ${pct}%\n${pct < 75 ? "⚠️ Below 75% threshold!" : "✓ Good standing"}`);
  }

  // ── Privacy gate ──────────────────────────────────────────────────────────
  if (privacySetting === "none") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Attendance</Text>
        </View>
        <View style={styles.privacyGate}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={[styles.privacyTitle, { color: C.text }]}>Attendance is private</Text>
          <Text style={[styles.privacyDesc, { color: C.textSecondary }]}>
            Your privacy setting is{" "}
            <Text style={{ fontWeight: "500", color: C.purple }}>Private (none)</Text>.
            {"\n\n"}No academic data is shared or visible.
            {"\n\n"}Go to Profile → Privacy Settings to change this.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  // ── End privacy gate ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Attendance</Text>
      </View>
      <View style={[styles.tabRow, { borderBottomColor: C.border }]}>
        {(["overview", "history"] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
            <Text style={[styles.tabText, { color: activeTab === tab ? C.purple : C.textSecondary }, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" ? (
          <>
            <View style={[styles.overallCard, { backgroundColor: C.bgHighlight, borderColor: C.purpleBorder }]}>
              <View style={styles.overallLeft}>
                <Text style={[styles.overallPct, { color: C.purple }]}>{overallPct}%</Text>
                <Text style={[styles.overallLabel, { color: C.textSecondary }]}>Overall attendance</Text>
                <View style={[styles.overallBar, { backgroundColor: C.bgSecondary }]}>
                  <View style={[styles.overallFill, { width: `${overallPct}%` as any, backgroundColor: overallPct >= 75 ? "#1D9E75" : "#E24B4A" }]} />
                </View>
              </View>
              <View style={styles.overallStats}>
                {[[presentCount, "#1D9E75", "Present"], [absentCount, "#E24B4A", "Absent"], [lateCount, "#BA7517", "Late"]].map(([num, color, label]) => (
                  <View key={label as string} style={styles.miniStat}>
                    <Text style={[styles.miniNum, { color: color as string }]}>{num as number}</Text>
                    <Text style={[styles.miniLabel, { color: C.textSecondary }]}>{label as string}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>By course</Text>
            {COURSE_SUMMARIES.map(course => {
              const pct = Math.round((course.present / course.total) * 100);
              return (
                <TouchableOpacity key={course.code} style={[styles.courseRow, { borderColor: C.border, backgroundColor: C.bgCard }]} onPress={() => handleCoursePress(course)} activeOpacity={0.7}>
                  <View style={[styles.courseColorDot, { backgroundColor: course.color }]} />
                  <View style={styles.courseRowInfo}>
                    <View style={styles.courseRowTop}>
                      <Text style={[styles.courseRowName, { color: C.text }]}>{course.name}</Text>
                      <Text style={[styles.courseRowPct, { color: pct < 75 ? "#E24B4A" : "#1D9E75" }]}>{pct}%</Text>
                    </View>
                    <View style={[styles.courseBarTrack, { backgroundColor: C.bgSecondary }]}>
                      <View style={[styles.courseBarFill, { width: `${pct}%` as any, backgroundColor: pct < 75 ? "#E24B4A" : course.color }]} />
                    </View>
                    <Text style={[styles.courseRowSub, { color: C.textMuted }]}>{course.present}/{course.total} classes{pct < 75 ? "  ⚠️ Low" : ""}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(["all", "present", "absent", "late", "excused"] as FilterType[]).map(f => (
                <TouchableOpacity key={f} style={[styles.filterPill, { borderColor: C.border }, filter === f && styles.filterPillActive]} onPress={() => setFilter(f)} activeOpacity={0.7}>
                  <Text style={[styles.filterPillText, { color: filter === f ? "#fff" : C.textSecondary }, filter === f && styles.filterPillTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {filteredRecords.length === 0 ? (
              <View style={styles.emptyState}><Text style={[styles.emptyText, { color: C.textMuted }]}>No records found</Text></View>
            ) : (
              filteredRecords.map(record => {
                const cfg = STATUS_CONFIG[record.status];
                return (
                  <TouchableOpacity key={record.id} style={[styles.recordCard, { borderColor: C.border, backgroundColor: C.bgCard }]} onPress={() => handleRecordPress(record)} activeOpacity={0.7}>
                    <View style={[styles.recordDot, { backgroundColor: cfg.dot }]} />
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordName, { color: C.text }]}>{record.courseName}</Text>
                      <Text style={[styles.recordMeta, { color: C.textSecondary }]}>{record.date} · {record.time} · {record.courseCode}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: "500" },
  tabRow: { flexDirection: "row", borderBottomWidth: 0.5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#534AB7" },
  tabText: { fontSize: 14 },
  tabTextActive: { fontWeight: "500" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32, gap: 12 },
  overallCard: { borderRadius: 16, padding: 20, flexDirection: "row", gap: 16, borderWidth: 0.5 },
  overallLeft: { flex: 1 },
  overallPct: { fontSize: 40, fontWeight: "500" },
  overallLabel: { fontSize: 12, marginBottom: 10 },
  overallBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  overallFill: { height: "100%", borderRadius: 3 },
  overallStats: { justifyContent: "space-around" },
  miniStat: { alignItems: "center" },
  miniNum: { fontSize: 20, fontWeight: "500" },
  miniLabel: { fontSize: 11 },
  sectionLabel: { fontSize: 11, fontWeight: "500", color: "#888", textTransform: "uppercase", letterSpacing: 0.8 },
  courseRow: { flexDirection: "row", gap: 12, alignItems: "center", borderRadius: 12, borderWidth: 0.5, padding: 14 },
  courseColorDot: { width: 10, height: 10, borderRadius: 5 },
  courseRowInfo: { flex: 1 },
  courseRowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  courseRowName: { fontSize: 14, fontWeight: "500" },
  courseRowPct: { fontSize: 14, fontWeight: "500" },
  courseBarTrack: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 4 },
  courseBarFill: { height: "100%", borderRadius: 2 },
  courseRowSub: { fontSize: 11 },
  filterRow: { gap: 8, flexDirection: "row", paddingBottom: 4 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, backgroundColor: "transparent" },
  filterPillActive: { backgroundColor: "#534AB7", borderColor: "#534AB7" },
  filterPillText: { fontSize: 13 },
  filterPillTextActive: { color: "#fff", fontWeight: "500" },
  recordCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 0.5, padding: 14 },
  recordDot: { width: 10, height: 10, borderRadius: 5 },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 14, fontWeight: "500", marginBottom: 3 },
  recordMeta: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 14 },
  privacyGate: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  privacyIcon: { fontSize: 48, marginBottom: 16 },
  privacyTitle: { fontSize: 18, fontWeight: "500", marginBottom: 12, textAlign: "center" },
  privacyDesc: { fontSize: 14, lineHeight: 22, textAlign: "center" },
});
