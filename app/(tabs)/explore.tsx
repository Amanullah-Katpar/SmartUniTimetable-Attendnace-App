import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext, useTheme } from "../context/AppContext";

interface Assignment { id: number; title: string; type: "Assignment" | "Quiz" | "Midterm" | "Lab" | "Project" | "Final"; marks: number; total: number; date: string; feedback?: string; }
interface Course { code: string; name: string; credits: number; assignments: Assignment[]; color: string; }

const COURSES: Course[] = [
  { code: "CS301", name: "Algorithms & Data Structures", credits: 15, color: "#534AB7", assignments: [
    { id: 1, title: "Assignment 1", type: "Assignment", marks: 18, total: 20, date: "Mar 10", feedback: "Good work on sorting algorithms." },
    { id: 2, title: "Assignment 2", type: "Assignment", marks: 17, total: 20, date: "Apr 2", feedback: "Graph traversal needs improvement." },
    { id: 3, title: "Quiz 1", type: "Quiz", marks: 9, total: 10, date: "Mar 20" },
    { id: 4, title: "Quiz 2", type: "Quiz", marks: 8, total: 10, date: "Apr 15" },
    { id: 5, title: "Midterm", type: "Midterm", marks: 38, total: 50, date: "Apr 1", feedback: "Dynamic programming section was weak." },
  ]},
  { code: "CS315", name: "Database Systems", credits: 12, color: "#1D9E75", assignments: [
    { id: 6, title: "Lab Report 1", type: "Lab", marks: 19, total: 20, date: "Mar 15" },
    { id: 7, title: "Lab Report 2", type: "Lab", marks: 17, total: 20, date: "Apr 10" },
    { id: 8, title: "Quiz 1", type: "Quiz", marks: 7, total: 10, date: "Mar 25" },
    { id: 9, title: "Midterm", type: "Midterm", marks: 40, total: 50, date: "Apr 3", feedback: "Strong SQL skills demonstrated." },
    { id: 10, title: "Project", type: "Project", marks: 44, total: 50, date: "May 1", feedback: "Excellent database design." },
  ]},
  { code: "CS322", name: "Operating Systems", credits: 12, color: "#D85A30", assignments: [
    { id: 11, title: "Assignment 1", type: "Assignment", marks: 14, total: 20, date: "Mar 12" },
    { id: 12, title: "Lab Report 1", type: "Lab", marks: 16, total: 20, date: "Mar 28" },
    { id: 13, title: "Quiz 1", type: "Quiz", marks: 6, total: 10, date: "Apr 5" },
    { id: 14, title: "Midterm", type: "Midterm", marks: 33, total: 50, date: "Apr 8", feedback: "Process scheduling concepts need review." },
  ]},
  { code: "CS330", name: "Software Engineering", credits: 12, color: "#185FA5", assignments: [
    { id: 15, title: "Assignment 1", type: "Assignment", marks: 20, total: 20, date: "Mar 8", feedback: "Perfect submission!" },
    { id: 16, title: "Quiz 1", type: "Quiz", marks: 10, total: 10, date: "Mar 22" },
    { id: 17, title: "Project Sprint 1", type: "Project", marks: 47, total: 50, date: "Apr 20", feedback: "Outstanding agile implementation." },
    { id: 18, title: "Midterm", type: "Midterm", marks: 46, total: 50, date: "Apr 6" },
  ]},
  { code: "MA201", name: "Calculus II", credits: 12, color: "#BA7517", assignments: [
    { id: 19, title: "Problem Set 1", type: "Assignment", marks: 15, total: 20, date: "Mar 14" },
    { id: 20, title: "Problem Set 2", type: "Assignment", marks: 14, total: 20, date: "Apr 4" },
    { id: 21, title: "Problem Set 3", type: "Assignment", marks: 16, total: 20, date: "Apr 25" },
    { id: 22, title: "Quiz 1", type: "Quiz", marks: 7, total: 10, date: "Mar 18" },
    { id: 23, title: "Midterm", type: "Midterm", marks: 35, total: 50, date: "Apr 2", feedback: "Integration techniques need more practice." },
  ]},
  { code: "EN210", name: "Technical Writing", credits: 9, color: "#993556", assignments: [
    { id: 24, title: "Essay 1", type: "Assignment", marks: 18, total: 20, date: "Mar 20", feedback: "Well structured and clear." },
    { id: 25, title: "Essay 2", type: "Assignment", marks: 19, total: 20, date: "Apr 18", feedback: "Excellent technical vocabulary." },
    { id: 26, title: "Presentation", type: "Project", marks: 23, total: 25, date: "May 5" },
  ]},
];

function calcPct(assignments: Assignment[]) { const t = assignments.reduce((s,a)=>s+a.total,0); const e = assignments.reduce((s,a)=>s+a.marks,0); return t===0?0:Math.round((e/t)*100); }
function pctToGrade(p: number) { if(p>=90)return"A+"; if(p>=85)return"A"; if(p>=80)return"A−"; if(p>=75)return"B+"; if(p>=70)return"B"; if(p>=65)return"B−"; if(p>=60)return"C+"; if(p>=55)return"C"; if(p>=50)return"C−"; return"F"; }
function gradeColor(p: number) { if(p>=80)return{bg:"#E1F5EE",text:"#085041"}; if(p>=65)return{bg:"#E6F1FB",text:"#0C447C"}; if(p>=50)return{bg:"#FAEEDA",text:"#633806"}; return{bg:"#FCEBEB",text:"#791F1F"}; }
function typeStyle(t: Assignment["type"]) { switch(t){ case"Assignment":return{bg:"#EEEDFE",text:"#3C3489"}; case"Quiz":return{bg:"#E1F5EE",text:"#085041"}; case"Midterm":return{bg:"#FAEEDA",text:"#633806"}; case"Lab":return{bg:"#E6F1FB",text:"#0C447C"}; case"Project":return{bg:"#F5C4B3",text:"#712B13"}; case"Final":return{bg:"#FCEBEB",text:"#791F1F"}; } }
function calcGPA(courses: Course[]) { let tp=0,tc=0; courses.forEach(c=>{ const p=calcPct(c.assignments); const g=pctToGrade(p); let pts=0; if(g==="A+"||g==="A")pts=4.0; else if(g==="A−")pts=3.7; else if(g==="B+")pts=3.3; else if(g==="B")pts=3.0; else if(g==="B−")pts=2.7; else if(g==="C+")pts=2.3; else if(g==="C")pts=2.0; else if(g==="C−")pts=1.7; tp+=pts*c.credits; tc+=c.credits; }); return tc===0?0:Math.round((tp/tc)*100)/100; }

export default function GradesScreen() {
  const { colors, dark } = useTheme();
  const { privacySetting } = useAppContext();
  const [activeTab, setActiveTab] = useState<"summary"|"details">("summary");
  const [expandedCode, setExpandedCode] = useState<string|null>(null);
  const C = colors;
  const gpa = calcGPA(COURSES);
  const avgPct = Math.round(COURSES.reduce((s,c)=>s+calcPct(c.assignments),0)/COURSES.length);

  // ── Privacy gate ──────────────────────────────────────────────────────────
  if (privacySetting === "none") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Grades</Text>
        </View>
        <View style={styles.privacyGate}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={[styles.privacyTitle, { color: C.text }]}>Grades are private</Text>
          <Text style={[styles.privacyDesc, { color: C.textSecondary }]}>
            Your privacy setting is set to{" "}
            <Text style={{ fontWeight: "500", color: C.purple }}>Private (none)</Text>.
            {"\n\n"}No academic data is shared or visible.
            {"\n\n"}Go to Profile → Privacy Settings to change this.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (privacySetting === "attendance") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Grades</Text>
        </View>
        <View style={styles.privacyGate}>
          <Text style={styles.privacyIcon}>🔐</Text>
          <Text style={[styles.privacyTitle, { color: C.text }]}>Grades are restricted</Text>
          <Text style={[styles.privacyDesc, { color: C.textSecondary }]}>
            Your privacy setting is{" "}
            <Text style={{ fontWeight: "500", color: C.purple }}>Attendance only</Text>.
            {"\n\n"}Grade details are hidden. Only your attendance is visible to others.
            {"\n\n"}Go to Profile → Privacy Settings and switch to{" "}
            <Text style={{ fontWeight: "500" }}>Full academic record</Text> to view grades.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  // ── End privacy gate ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe,{backgroundColor:C.bg}]}>
      <StatusBar style={dark?"light":"dark"} />
      <View style={[styles.header,{borderBottomColor:C.border}]}>
        <Text style={[styles.headerTitle,{color:C.text}]}>Grades</Text>
        <TouchableOpacity onPress={()=>Alert.alert("GPA info",`Current GPA: ${gpa}\nAverage score: ${avgPct}%\n\nA/A+ = 4.0 · A− = 3.7\nB+ = 3.3 · B = 3.0 · B− = 2.7\nC+ = 2.3 · C = 2.0`)} style={[styles.gpaBadge,{backgroundColor:C.bgHighlight,borderColor:C.purpleBorder}]}>
          <Text style={[styles.gpaLabel,{color:C.textSecondary}]}>GPA</Text>
          <Text style={[styles.gpaValue,{color:C.purple}]}>{gpa}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.tabRow,{borderBottomColor:C.border}]}>
        {(["summary","details"] as const).map(tab=>(
          <TouchableOpacity key={tab} style={[styles.tab,activeTab===tab&&styles.tabActive]} onPress={()=>setActiveTab(tab)} activeOpacity={0.7}>
            <Text style={[styles.tabText,{color:activeTab===tab?C.purple:C.textSecondary},activeTab===tab&&styles.tabTextActive]}>{tab==="summary"?"Summary":"By course"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab==="summary"?(
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard,{backgroundColor:C.bgSecondary}]}><Text style={[styles.statLabel,{color:C.textSecondary}]}>Semester GPA</Text><Text style={[styles.statValue,{color:C.purple}]}>{gpa}</Text></View>
              <View style={[styles.statCard,{backgroundColor:C.bgSecondary}]}><Text style={[styles.statLabel,{color:C.textSecondary}]}>Avg score</Text><Text style={[styles.statValue,{color:C.purple}]}>{avgPct}%</Text></View>
            </View>
            <Text style={[styles.sectionLabel,{color:C.textSecondary}]}>Course grades</Text>
            {COURSES.map(course=>{
              const pct=calcPct(course.assignments); const grade=pctToGrade(pct); const gc=gradeColor(pct);
              const earned=course.assignments.reduce((s,a)=>s+a.marks,0); const total=course.assignments.reduce((s,a)=>s+a.total,0);
              return(
                <TouchableOpacity key={course.code} style={[styles.summaryRow,{borderColor:C.border,backgroundColor:C.bgCard}]} onPress={()=>setActiveTab("details")} activeOpacity={0.7}>
                  <View style={[styles.summaryColorDot,{backgroundColor:course.color}]}/>
                  <View style={styles.summaryInfo}>
                    <View style={styles.summaryTop}>
                      <Text style={[styles.summaryName,{color:C.text}]}>{course.name}</Text>
                      <View style={[styles.gradePill,{backgroundColor:gc.bg}]}><Text style={[styles.gradeText,{color:gc.text}]}>{grade}</Text></View>
                    </View>
                    <View style={styles.summaryBottom}>
                      <Text style={[styles.summaryMeta,{color:C.textSecondary}]}>{earned}/{total} marks · {course.credits} credits</Text>
                      <Text style={[styles.summaryPct,{color:pct>=65?"#1D9E75":"#E24B4A"}]}>{pct}%</Text>
                    </View>
                    <View style={[styles.summaryBar,{backgroundColor:C.bgSecondary}]}>
                      <View style={[styles.summaryBarFill,{width:`${pct}%` as any,backgroundColor:course.color}]}/>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ):(
          <>
            <Text style={[styles.sectionLabel,{color:C.textSecondary}]}>Tap a course · Tap an assessment for details</Text>
            {COURSES.map(course=>{
              const pct=calcPct(course.assignments); const grade=pctToGrade(pct); const gc=gradeColor(pct);
              const isOpen=expandedCode===course.code;
              return(
                <View key={course.code} style={[styles.courseCard,{borderColor:C.border,backgroundColor:C.bgCard}]}>
                  <TouchableOpacity style={styles.courseHeader} onPress={()=>setExpandedCode(isOpen?null:course.code)} activeOpacity={0.7}>
                    <View style={[styles.courseColorBar,{backgroundColor:course.color}]}/>
                    <View style={styles.courseHeaderInfo}>
                      <Text style={[styles.courseName,{color:C.text}]}>{course.name}</Text>
                      <Text style={[styles.courseCode,{color:C.textSecondary}]}>{course.code} · {course.assignments.length} assessments</Text>
                      <View style={styles.courseProgressRow}>
                        <View style={[styles.courseProgressTrack,{backgroundColor:C.bgSecondary}]}>
                          <View style={[styles.courseProgressFill,{width:`${pct}%` as any,backgroundColor:course.color}]}/>
                        </View>
                        <Text style={[styles.courseProgressPct,{color:C.textSecondary}]}>{pct}%</Text>
                      </View>
                    </View>
                    <View style={styles.courseHeaderRight}>
                      <View style={[styles.gradePill,{backgroundColor:gc.bg}]}><Text style={[styles.gradeText,{color:gc.text}]}>{grade}</Text></View>
                      <Text style={[styles.chevron,{color:C.textMuted}]}>{isOpen?"▲":"▼"}</Text>
                    </View>
                  </TouchableOpacity>
                  {isOpen&&(
                    <View style={[styles.assignmentsList,{borderTopColor:C.border}]}>
                      {course.assignments.map((a,i)=>{
                        const ap=Math.round((a.marks/a.total)*100); const agc=gradeColor(ap); const tc=typeStyle(a.type);
                        return(
                          <TouchableOpacity key={a.id} style={[styles.assignmentRow,{borderBottomColor:i===course.assignments.length-1?"transparent":C.border}]} onPress={()=>Alert.alert(a.title,`Marks: ${a.marks}/${a.total} (${ap}%)\nGrade: ${pctToGrade(ap)}\nDate: ${a.date}${a.feedback?`\n\nFeedback: "${a.feedback}"`:""}`)}>
                            <View style={styles.assignmentLeft}>
                              <Text style={[styles.assignmentTitle,{color:C.text}]}>{a.title}</Text>
                              <View style={styles.assignmentMeta}>
                                <View style={[styles.typePill,{backgroundColor:tc?.bg}]}><Text style={[styles.typePillText,{color:tc?.text}]}>{a.type}</Text></View>
                                <Text style={[styles.assignmentDate,{color:C.textMuted}]}>{a.date}</Text>
                                {a.feedback&&<Text style={{color:C.purple,fontSize:11}}>💬</Text>}
                              </View>
                            </View>
                            <View style={styles.assignmentRight}>
                              <Text style={[styles.marksText,{color:C.text}]}>{a.marks}<Text style={[styles.marksTotal,{color:C.textSecondary}]}>/{a.total}</Text></Text>
                              <View style={[styles.gradePill,{backgroundColor:agc.bg}]}><Text style={[styles.gradeText,{color:agc.text}]}>{pctToGrade(ap)}</Text></View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1}, header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingHorizontal:20,paddingTop:16,paddingBottom:14,borderBottomWidth:0.5},
  headerTitle:{fontSize:20,fontWeight:"500"}, gpaBadge:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:12,paddingVertical:6,borderRadius:16,borderWidth:0.5},
  gpaLabel:{fontSize:12}, gpaValue:{fontSize:16,fontWeight:"500"}, tabRow:{flexDirection:"row",borderBottomWidth:0.5},
  tab:{flex:1,paddingVertical:12,alignItems:"center"}, tabActive:{borderBottomWidth:2,borderBottomColor:"#534AB7"},
  tabText:{fontSize:14}, tabTextActive:{fontWeight:"500"}, scroll:{flex:1}, scrollContent:{padding:20,paddingBottom:32,gap:10},
  statsRow:{flexDirection:"row",gap:10}, statCard:{flex:1,borderRadius:10,padding:14},
  statLabel:{fontSize:12,marginBottom:4}, statValue:{fontSize:28,fontWeight:"500"},
  sectionLabel:{fontSize:11,fontWeight:"500",textTransform:"uppercase",letterSpacing:0.8,marginTop:4,marginBottom:2},
  summaryRow:{flexDirection:"row",alignItems:"center",gap:12,borderRadius:12,borderWidth:0.5,padding:14},
  summaryColorDot:{width:10,height:10,borderRadius:5,marginTop:2}, summaryInfo:{flex:1},
  summaryTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:4},
  summaryName:{fontSize:14,fontWeight:"500",flex:1,marginRight:8},
  summaryBottom:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},
  summaryMeta:{fontSize:12}, summaryPct:{fontSize:12,fontWeight:"500"},
  summaryBar:{height:4,borderRadius:2,overflow:"hidden"}, summaryBarFill:{height:"100%",borderRadius:2},
  courseCard:{borderRadius:12,borderWidth:0.5,overflow:"hidden"},
  courseHeader:{flexDirection:"row",alignItems:"center",padding:14,gap:12},
  courseColorBar:{width:4,borderRadius:2,minHeight:50},
  courseHeaderInfo:{flex:1}, courseName:{fontSize:14,fontWeight:"500",marginBottom:3},
  courseCode:{fontSize:12,marginBottom:6}, courseProgressRow:{flexDirection:"row",alignItems:"center",gap:8},
  courseProgressTrack:{flex:1,height:4,borderRadius:2,overflow:"hidden"},
  courseProgressFill:{height:"100%",borderRadius:2}, courseProgressPct:{fontSize:11,minWidth:32,textAlign:"right"},
  courseHeaderRight:{alignItems:"flex-end",gap:8}, chevron:{fontSize:10},
  assignmentsList:{borderTopWidth:0.5},
  assignmentRow:{flexDirection:"row",alignItems:"center",paddingHorizontal:16,paddingVertical:12,borderBottomWidth:0.5},
  assignmentLeft:{flex:1}, assignmentTitle:{fontSize:13,fontWeight:"500",marginBottom:4},
  assignmentMeta:{flexDirection:"row",alignItems:"center",gap:8},
  typePill:{paddingHorizontal:7,paddingVertical:2,borderRadius:8},
  typePillText:{fontSize:11,fontWeight:"500"}, assignmentDate:{fontSize:11},
  assignmentRight:{alignItems:"flex-end",gap:4}, marksText:{fontSize:15,fontWeight:"500"},
  marksTotal:{fontSize:13}, gradePill:{paddingHorizontal:8,paddingVertical:3,borderRadius:10},
  gradeText:{fontSize:11,fontWeight:"500"},
  privacyGate:{ flex:1, alignItems:"center", justifyContent:"center", padding:32 },
  privacyIcon:{ fontSize:48, marginBottom:16 },
  privacyTitle:{ fontSize:18, fontWeight:"500", marginBottom:12, textAlign:"center" },
  privacyDesc:{ fontSize:14, lineHeight:22, textAlign:"center" },
});
