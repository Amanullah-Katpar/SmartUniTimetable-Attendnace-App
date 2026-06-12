import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext, useTheme } from "../context/AppContext";

type ClassType = "Lecture" | "Lab" | "Tutorial" | "Seminar";
interface ClassItem { id: number; start: string; end: string; name: string; room: string; building: string; type: ClassType; courseCode: string; }

const SCHEDULE: Record<number, ClassItem[]> = {
  0: [],
  1: [
    { id: 1,  start: "09:00", end: "10:00", name: "Algorithms & Data Structures", room: "B12",    building: "CS Block",     type: "Lecture",  courseCode: "CS301" },
    { id: 2,  start: "11:00", end: "13:00", name: "Database Systems Lab",          room: "Lab 3",  building: "IT Centre",    type: "Lab",      courseCode: "CS315" },
    { id: 3,  start: "14:00", end: "15:00", name: "Software Engineering",          room: "A204",   building: "Main Hall",    type: "Lecture",  courseCode: "CS330" },
  ],
  2: [
    { id: 4,  start: "10:00", end: "11:00", name: "Calculus II",                   room: "M101",   building: "Math Block",   type: "Lecture",  courseCode: "MA201" },
    { id: 5,  start: "13:00", end: "14:00", name: "Algorithms Tutorial",           room: "CS-T2",  building: "CS Block",     type: "Tutorial", courseCode: "CS301" },
    { id: 6,  start: "15:00", end: "16:00", name: "Technical Writing",             room: "H310",   building: "Humanities",   type: "Seminar",  courseCode: "EN210" },
  ],
  3: [
    { id: 7,  start: "09:00", end: "10:00", name: "Algorithms & Data Structures",  room: "B12",    building: "CS Block",     type: "Lecture",  courseCode: "CS301" },
    { id: 8,  start: "11:00", end: "12:00", name: "Operating Systems",             room: "A102",   building: "Main Hall",    type: "Lecture",  courseCode: "CS322" },
    { id: 9,  start: "14:00", end: "16:00", name: "Networks Lab",                  room: "Lab 5",  building: "IT Centre",    type: "Lab",      courseCode: "CS322" },
  ],
  4: [
    { id: 10, start: "10:00", end: "11:00", name: "Calculus II",                   room: "M101",   building: "Math Block",   type: "Lecture",  courseCode: "MA201" },
    { id: 11, start: "12:00", end: "13:00", name: "Software Engineering",          room: "A204",   building: "Main Hall",    type: "Seminar",  courseCode: "CS330" },
  ],
  5: [
    { id: 12, start: "09:00", end: "11:00", name: "Operating Systems Lab",         room: "Lab 1",  building: "IT Centre",    type: "Lab",      courseCode: "CS322" },
  ],
  6: [],
};

const DAY_NAMES    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Per-type accent colours (left border + badge)
const TYPE_COLORS: Record<ClassType, { border: string; badgeBg: string; badgeText: string; icon: string }> = {
  Lecture:  { border: "#534AB7", badgeBg: "#EEEDFE", badgeText: "#3C3489", icon: "📖" },
  Lab:      { border: "#1D9E75", badgeBg: "#E1F5EE", badgeText: "#085041", icon: "🔬" },
  Tutorial: { border: "#D48C00", badgeBg: "#FEF3DA", badgeText: "#633806", icon: "✏️" },
  Seminar:  { border: "#C0442B", badgeBg: "#FCEBEB", badgeText: "#791F1F", icon: "🎤" },
};

function parseMinutes(t: string) { const [h,m] = t.split(":").map(Number); return h*60+m; }
function nowMinutes()             { const d = new Date(); return d.getHours()*60+d.getMinutes(); }
function minutesUntil(t: string)  { return parseMinutes(t) - nowMinutes(); }
function formatDuration(s: string, e: string) { const m = parseMinutes(e)-parseMinutes(s); return m >= 60 ? `${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}` : `${m}m`; }
function formatCountdown(m: number) { return m < 60 ? `in ${m} min` : `in ${Math.floor(m/60)}h ${m%60}m`; }
function getActiveClass(cls: ClassItem[]) { const n = nowMinutes(); return cls.find(c => parseMinutes(c.start)<=n && parseMinutes(c.end)>=n); }
function getNextClass(cls: ClassItem[])   { const n = nowMinutes(); return cls.filter(c=>parseMinutes(c.start)>n).sort((a,b)=>parseMinutes(a.start)-parseMinutes(b.start))[0]; }
function greetingByHour() { const h = new Date().getHours(); if(h<12) return "Good morning"; if(h<17) return "Good afternoon"; return "Good evening"; }

export default function TimetableScreen() {
  const router   = useRouter();
  const { profile } = useAppContext();
  const { colors, dark } = useTheme();
  const C = colors;

  const today      = new Date();
  const todayDow   = today.getDay();
  const [sel, setSel] = useState(todayDow);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - todayDow + i);
    return { dow: d.getDay(), date: d.getDate(), month: d.getMonth() };
  });

  const classes    = SCHEDULE[sel] ?? [];
  const isToday    = sel === todayDow;
  const activeClass = isToday ? getActiveClass(classes) : undefined;
  const nextClass   = isToday && !activeClass ? getNextClass(classes) : undefined;
  const firstName  = profile.name.split(" ")[0];
  const initials   = profile.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  function cpAlert(title: string, msg: string, buttons?: any[]) {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${msg}`);
    } else {
      Alert.alert(title, msg, buttons);
    }
  }

  function handleMarkAttendance() {
    cpAlert("Mark Attendance", "Mark yourself present for this class?", [
      { text: "Cancel", style: "cancel" },
      { text: "Mark Present", onPress: () => cpAlert("✓ Marked", "Attendance recorded for this class.") },
    ]);
  }

  function handleClassPress(c: ClassItem) {
    cpAlert(
      c.name,
      `📌 ${c.courseCode}  ·  ${c.type}\n📍 ${c.room}, ${c.building}\n🕐 ${c.start} – ${c.end}  (${formatDuration(c.start, c.end)})`,
      [
        { text: "Close",          style: "cancel" },
        { text: "View Attendance", onPress: () => router.push("/(tabs)/attendance") },
      ]
    );
  }

  const selectedDateLabel = (() => {
    const wd = weekDays.find(w => w.dow === sel);
    if (!wd) return "";
    if (isToday) return `Today · ${MONTH_NAMES[wd.month]} ${wd.date}`;
    return `${FULL_DAY[sel]} · ${MONTH_NAMES[wd.month]} ${wd.date}`;
  })();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[styles.greeting, { color: C.textSecondary }]}>{greetingByHour()},</Text>
          <Text style={[styles.name, { color: C.text }]}>{firstName}</Text>
        </View>
        <TouchableOpacity style={[styles.avatar, { backgroundColor: "#AFA9EC" }]}
          onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.8}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Day strip ──────────────────────────────────────────────── */}
      <View style={[styles.dayStripWrap, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStripRow}>
          {weekDays.map(({ dow, date }) => {
            const active  = dow === sel;
            const hasClass = (SCHEDULE[dow]?.length ?? 0) > 0;
            return (
              <TouchableOpacity key={dow} onPress={() => setSel(dow)} activeOpacity={0.7}
                style={[styles.dayCell, active && { backgroundColor: "#534AB7" }]}>
                <Text style={[styles.dayLabel, { color: active ? "#fff" : C.textMuted }]}>{DAY_NAMES[dow]}</Text>
                <Text style={[styles.dayNum,   { color: active ? "#fff" : C.text }]}>{date}</Text>
                <View style={[styles.dot,
                  hasClass  && !active && { backgroundColor: "#AFA9EC" },
                  hasClass  &&  active && { backgroundColor: "rgba(255,255,255,0.7)" },
                  !hasClass && { backgroundColor: "transparent" },
                ]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.body, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}>

        {/* ── Active / Next class banner ──────────────────────────── */}
        {isToday && activeClass && (() => {
          const tc = TYPE_COLORS[activeClass.type];
          return (
            <View style={[styles.banner, { backgroundColor: "#534AB7" }]}>
              <View style={styles.bannerTop}>
                <View style={styles.bannerPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.bannerPillText}>In progress</Text>
                </View>
                <Text style={styles.bannerTime}>{activeClass.start} – {activeClass.end}</Text>
              </View>
              <Text style={styles.bannerName}>{activeClass.name}</Text>
              <View style={styles.bannerMeta}>
                <Text style={styles.bannerMetaText}>📍 {activeClass.room}  ·  {activeClass.building}</Text>
                <Text style={styles.bannerMetaText}>⏱ {formatDuration(activeClass.start, activeClass.end)}</Text>
              </View>
              <TouchableOpacity style={styles.markBtn} onPress={handleMarkAttendance} activeOpacity={0.85}>
                <Text style={styles.markBtnText}>✓  Mark Attendance</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {isToday && nextClass && (() => {
          const mins = minutesUntil(nextClass.start);
          return (
            <View style={[styles.banner, { backgroundColor: "#2A2560" }]}>
              <View style={styles.bannerTop}>
                <View style={[styles.bannerPill, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                  <Text style={styles.bannerPillText}>Up next  ·  {mins > 0 ? formatCountdown(mins) : "now"}</Text>
                </View>
                <Text style={styles.bannerTime}>{nextClass.start} – {nextClass.end}</Text>
              </View>
              <Text style={styles.bannerName}>{nextClass.name}</Text>
              <View style={styles.bannerMeta}>
                <Text style={styles.bannerMetaText}>📍 {nextClass.room}  ·  {nextClass.building}</Text>
                <Text style={styles.bannerMetaText}>⏱ {formatDuration(nextClass.start, nextClass.end)}</Text>
              </View>
            </View>
          );
        })()}

        {/* ── Schedule section header ─────────────────────────────── */}
        {classes.length > 0 && (
          <View style={styles.scheduleHeader}>
            <Text style={[styles.scheduleTitle, { color: C.text }]}>{selectedDateLabel}</Text>
            <View style={[styles.countBadge, { backgroundColor: C.bgHighlight, borderColor: C.purpleBorder }]}>
              <Text style={{ fontSize: 12, color: "#534AB7", fontWeight: "500" }}>
                {classes.length} class{classes.length > 1 ? "es" : ""}
              </Text>
            </View>
          </View>
        )}

        {/* ── Class cards ─────────────────────────────────────────── */}
        {classes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>☕</Text>
            <Text style={[styles.emptyTitle, { color: C.text }]}>No classes</Text>
            <Text style={[styles.emptySub,   { color: C.textMuted }]}>Enjoy your free day!</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {classes.map((c, idx) => {
              const tc      = TYPE_COLORS[c.type];
              const isActive = isToday && activeClass?.id === c.id;
              const isNext   = isToday && nextClass?.id === c.id;
              const isPast   = isToday && parseMinutes(c.end) < nowMinutes() && !isActive;

              return (
                <TouchableOpacity key={c.id} onPress={() => handleClassPress(c)} activeOpacity={0.75}
                  style={[
                    styles.card,
                    { backgroundColor: C.bgCard, borderColor: isActive ? tc.border : C.border },
                    isActive && { backgroundColor: C.bgHighlight },
                  ]}>

                  {/* Coloured left accent bar */}
                  <View style={[styles.cardAccent, { backgroundColor: isPast ? "#ccc" : tc.border }]} />

                  {/* Time column */}
                  <View style={styles.timeCol}>
                    <Text style={[styles.timeStart, { color: isPast ? C.textMuted : C.text }]}>{c.start}</Text>
                    <View style={[styles.timeDivider, { backgroundColor: C.border }]} />
                    <Text style={[styles.timeEnd,   { color: C.textMuted }]}>{c.end}</Text>
                    <Text style={[styles.timeDur,   { color: C.textMuted }]}>{formatDuration(c.start, c.end)}</Text>
                  </View>

                  {/* Vertical separator */}
                  <View style={[styles.vSep, { backgroundColor: C.border }]} />

                  {/* Class info */}
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={[styles.cardCode, { color: isPast ? C.textMuted : "#534AB7" }]}>{c.courseCode}</Text>
                      {isActive && <View style={styles.liveChip}><View style={styles.liveDotSmall}/><Text style={styles.liveChipText}>LIVE</Text></View>}
                      {isNext   && <View style={[styles.liveChip, { backgroundColor: "#2A2560" }]}><Text style={styles.liveChipText}>NEXT</Text></View>}
                    </View>

                    <Text style={[styles.cardName, { color: isPast ? C.textSecondary : C.text }]} numberOfLines={2}>{c.name}</Text>

                    <View style={styles.venueRow}>
                      <Text style={styles.venueIcon}>📍</Text>
                      <Text style={[styles.venueText, { color: C.textSecondary }]}>{c.room}  ·  {c.building}</Text>
                    </View>

                    <View style={[styles.typeBadge, { backgroundColor: isPast ? "#eee" : tc.badgeBg }]}>
                      <Text style={[styles.typeBadgeText, { color: isPast ? "#aaa" : tc.badgeText }]}>
                        {tc.icon}  {c.type}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1 },
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 0.5 },
  greeting:        { fontSize: 13 },
  name:            { fontSize: 22, fontWeight: "600", marginTop: 1 },
  avatar:          { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText:      { fontSize: 13, fontWeight: "600", color: "#26215C" },

  dayStripWrap:    { borderBottomWidth: 0.5 },
  dayStripRow:     { paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", gap: 4 },
  dayCell:         { alignItems: "center", paddingHorizontal: 11, paddingVertical: 8, borderRadius: 14, minWidth: 48, gap: 2 },
  dayLabel:        { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  dayNum:          { fontSize: 17, fontWeight: "600" },
  dot:             { width: 5, height: 5, borderRadius: 3, marginTop: 1 },

  body:            { padding: 16, gap: 12 },

  banner:          { borderRadius: 16, padding: 16, gap: 8 },
  bannerTop:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bannerPill:      { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bannerPillText:  { fontSize: 11, color: "#fff", fontWeight: "500" },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: "#7AFFC4" },
  bannerTime:      { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  bannerName:      { fontSize: 17, fontWeight: "600", color: "#fff" },
  bannerMeta:      { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  bannerMetaText:  { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  markBtn:         { marginTop: 4, backgroundColor: "#fff", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  markBtnText:     { fontSize: 14, fontWeight: "600", color: "#534AB7" },

  scheduleHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  scheduleTitle:   { fontSize: 15, fontWeight: "600" },
  countBadge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 0.5 },

  cardList:        { gap: 10 },
  card:            { flexDirection: "row", borderRadius: 14, borderWidth: 0.5, overflow: "hidden", minHeight: 88 },
  cardAccent:      { width: 4 },
  timeCol:         { width: 58, alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 2 },
  timeStart:       { fontSize: 13, fontWeight: "700" },
  timeDivider:     { width: 1, height: 12, marginVertical: 2 },
  timeEnd:         { fontSize: 11 },
  timeDur:         { fontSize: 10, marginTop: 2 },
  vSep:            { width: 0.5, marginVertical: 12 },
  cardBody:        { flex: 1, padding: 12, gap: 5 },
  cardTopRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  cardCode:        { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  liveChip:        { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#534AB7", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  liveDotSmall:    { width: 5, height: 5, borderRadius: 3, backgroundColor: "#7AFFC4" },
  liveChipText:    { fontSize: 9, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  cardName:        { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  venueRow:        { flexDirection: "row", alignItems: "center", gap: 4 },
  venueIcon:       { fontSize: 11 },
  venueText:       { fontSize: 12 },
  typeBadge:       { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, marginTop: 2 },
  typeBadgeText:   { fontSize: 11, fontWeight: "600" },

  empty:           { alignItems: "center", paddingVertical: 60 },
  emptyTitle:      { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  emptySub:        { fontSize: 14 },
});
