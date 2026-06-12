import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert, Modal, Platform, Pressable, ScrollView, Share,
  StyleSheet, Switch, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrivacySetting, useAppContext, useTheme } from "../context/AppContext";

// ─── Notification helper (web-only OS notifications) ─────────────────────
const NOTIF_MESSAGES: Record<string, { title: string; body: string }> = {
  classReminders:   { title: "Class Reminders ON",   body: "You'll be reminded before each class starts." },
  earlyReminder:    { title: "Early Reminder ON",    body: "You'll get a heads-up 15 minutes before class." },
  attendanceAlerts: { title: "Attendance Alerts ON", body: "You'll be alerted if your attendance drops below 75%." },
};
async function fireNotification(key: string, enabled: boolean) {
  if (!enabled || Platform.OS !== "web") return;
  if (!("Notification" in window)) return;
  const msg = NOTIF_MESSAGES[key];
  if (!msg) return;
  if (Notification.permission === "granted") {
    new Notification(msg.title, { body: msg.body, icon: "/favicon.ico" });
  } else if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    if (perm === "granted") new Notification(msg.title, { body: msg.body, icon: "/favicon.ico" });
  }
}

type AlertBtn = { text: string; style?: "default" | "cancel" | "destructive"; onPress: () => void };

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const C = colors;

  // ✅ FIX 1: single useAppContext() call
  const {
    settings, updateSetting,
    profile, updateProfile,
    privacySetting, updatePrivacySetting,
    logout,
  } = useAppContext();

  const [view, setView] = useState<"main" | "editProfile" | "changePassword" | "privacy" | "help">("main");
  const [draftName,  setDraftName]  = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [draftPhone, setDraftPhone] = useState(profile.phone);
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwError,    setPwError]    = useState("");
  const [pwSuccess,  setPwSuccess]  = useState(false);

  const [alertModal, setAlertModal] = useState<{
    visible: boolean; title: string; message: string; buttons: AlertBtn[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  function dismissAlert() { setAlertModal(s => ({ ...s, visible: false })); }

  function cpAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      setAlertModal({ visible: true, title, message, buttons: [{ text: "OK", style: "default", onPress: dismissAlert }] });
    } else {
      Alert.alert(title, message);
    }
  }

  function cpConfirm(title: string, message: string, onConfirm: () => void) {
    if (Platform.OS === "web") {
      setAlertModal({
        visible: true, title, message,
        buttons: [
          { text: "Cancel",  style: "cancel",      onPress: dismissAlert },
          { text: "Confirm", style: "destructive",  onPress: () => { dismissAlert(); onConfirm(); } },
        ],
      });
    } else {
      Alert.alert(title, message, [
        { text: "Cancel",  style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: onConfirm },
      ]);
    }
  }

  // Zero external dependencies — works in Expo Go without any installs
  async function cpDownload(filename: string, content: string, html?: string) {
    if (Platform.OS === "web") {
      const blob = new Blob([content], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      cpAlert("Downloaded!", `${filename} saved to your Downloads folder.`);
    } else {
      try {
        await Share.share({ message: content, title: filename });
      } catch (e: any) {
        if (e?.message !== "User did not share") {
          Alert.alert("Error", "Could not export the file.");
        }
      }
    }
  }

  const initials = profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  function openEdit() {
    setDraftName(profile.name); setDraftEmail(profile.email); setDraftPhone(profile.phone);
    setView("editProfile");
  }

  function handleSaveProfile() {
    if (!draftName.trim()) { cpAlert("Error", "Name cannot be empty."); return; }
    updateProfile({ name: draftName.trim(), email: draftEmail.trim(), phone: draftPhone.trim() });
    setView("main");
    cpAlert("Saved", "Profile updated successfully.");
  }

  function handleSavePassword() {
    setPwError(""); setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError("Please fill in all fields."); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    setPwSuccess(true);
    setTimeout(() => {
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSuccess(false); setView("main");
      cpAlert("Success", "Password changed successfully.");
    }, 1200);
  }

  function handleLogout() {
    cpConfirm("Log out", "Are you sure you want to log out?", () => {
      logout(); router.replace("/login");
    });
  }

  async function handleDownloadTranscript() {
    const content = `MOHAMMAD ALI JINNAH UNIVERSITY
OFFICIAL ACADEMIC TRANSCRIPT

Student Name: ${profile.name}
Student ID:   FA23-BSCS-0087
Email:        ${profile.email}
Phone:        ${profile.phone}
Program:      BS (Hons) Computer Science
Semester:     6 (Spring 2025)
CGPA:         3.6 / 4.0

COURSES COMPLETED:
--------------------------------------------------
CS301  Algorithms & Data Structures    A    3.0 cr
CS315  Database Systems                A-   3.0 cr
CS322  Operating Systems               B+   3.0 cr
CS330  Software Engineering            A    3.0 cr
MA201  Calculus II                     B+   3.0 cr
EN210  Technical Writing               A-   3.0 cr
--------------------------------------------------
Total Credits: 72

This is an official transcript issued by the
Registrar Office, Mohammad Ali Jinnah University,
Karachi, Pakistan.
`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Helvetica Neue',Arial,sans-serif;padding:40px;color:#111;}
      .hdr{text-align:center;border-bottom:2px solid #534AB7;padding-bottom:20px;margin-bottom:28px;}
      .uni{font-size:13px;font-weight:bold;color:#534AB7;text-transform:uppercase;letter-spacing:1px;}
      .ttl{font-size:24px;font-weight:bold;color:#534AB7;margin-top:6px;}
      .sec{margin-bottom:24px;}
      .st{font-size:11px;font-weight:bold;text-transform:uppercase;color:#888;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:12px;}
      .row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;}
      .lbl{color:#666;}.val{font-weight:500;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{background:#534AB7;color:#fff;padding:8px 12px;text-align:left;}
      td{padding:8px 12px;border-bottom:1px solid #eee;}
      .gr{display:flex;justify-content:space-between;font-size:16px;font-weight:bold;border-top:2px solid #534AB7;padding-top:12px;margin-top:8px;}
      .gv{color:#534AB7;}
      .ft{text-align:center;font-size:11px;color:#aaa;margin-top:32px;font-style:italic;}
    </style></head><body>
    <div class="hdr"><div class="uni">Mohammad Ali Jinnah University</div><div class="ttl">Official Academic Transcript</div></div>
    <div class="sec"><div class="st">Student Information</div>
      <div class="row"><span class="lbl">Student Name</span><span class="val">${profile.name}</span></div>
      <div class="row"><span class="lbl">Student ID</span><span class="val">FA23-BSCS-0087</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${profile.email}</span></div>
      <div class="row"><span class="lbl">Phone</span><span class="val">${profile.phone}</span></div>
      <div class="row"><span class="lbl">Program</span><span class="val">BS (Hons) Computer Science</span></div>
      <div class="row"><span class="lbl">Semester</span><span class="val">6 (Spring 2025)</span></div>
    </div>
    <div class="sec"><div class="st">Academic Record</div>
    <table><tr><th>Code</th><th>Course</th><th>Grade</th><th>Credits</th></tr>
      <tr><td>CS301</td><td>Algorithms &amp; Data Structures</td><td>A</td><td>3.0</td></tr>
      <tr><td>CS315</td><td>Database Systems</td><td>A-</td><td>3.0</td></tr>
      <tr><td>CS322</td><td>Operating Systems</td><td>B+</td><td>3.0</td></tr>
      <tr><td>CS330</td><td>Software Engineering</td><td>A</td><td>3.0</td></tr>
      <tr><td>MA201</td><td>Calculus II</td><td>B+</td><td>3.0</td></tr>
      <tr><td>EN210</td><td>Technical Writing</td><td>A-</td><td>3.0</td></tr>
    </table>
    <div class="gr"><span>Cumulative GPA</span><span class="gv">3.6 / 4.0</span></div>
    <div class="gr"><span>Total Credits</span><span class="gv">72</span></div></div>
    <div class="ft">Official transcript — Registrar Office, Mohammad Ali Jinnah University, Karachi.</div>
    </body></html>`;
    await cpDownload(`Transcript_${profile.name.replace(" ", "_")}_S6.pdf`, content, html);
  }

  // In-app alert modal (web only)
  const alertOverlay = Platform.OS === "web" ? (
    <Modal visible={alertModal.visible} transparent animationType="fade" onRequestClose={dismissAlert}>
      <Pressable style={styles.alertOverlay} onPress={alertModal.buttons.length === 1 ? dismissAlert : undefined}>
        <View style={[styles.alertBox, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[styles.alertTitle, { color: C.text }]}>{alertModal.title}</Text>
          {!!alertModal.message && (
            <Text style={[styles.alertMessage, { color: C.textSecondary }]}>{alertModal.message}</Text>
          )}
          <View style={[styles.alertActions, { borderTopColor: C.border }]}>
            {alertModal.buttons.map((btn, i) => (
              <TouchableOpacity key={btn.text} onPress={btn.onPress}
                style={[styles.alertBtn, i < alertModal.buttons.length - 1 && { borderRightWidth: 0.5, borderRightColor: C.border }]}>
                <Text style={[styles.alertBtnText, {
                  color: btn.style === "destructive" ? "#E24B4A" : btn.style === "cancel" ? C.textSecondary : C.purple,
                  fontWeight: btn.style === "cancel" ? "400" : "600",
                }]}>{btn.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  ) : null;

  // ─── EDIT PROFILE ────────────────────────────────────────────────────────
  if (view === "editProfile") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setView("main")} activeOpacity={0.7}>
            <Text style={{ fontSize: 15, color: C.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile} activeOpacity={0.7}>
            <Text style={{ fontSize: 15, color: C.purple, fontWeight: "500" }}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View style={styles.avatarCenter}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          </View>
          {[
            { label: "Full name", value: draftName,  set: setDraftName,  placeholder: "Your full name",    keyboard: "default" },
            { label: "Email",     value: draftEmail, set: setDraftEmail, placeholder: "your@email.com",    keyboard: "email-address" },
            { label: "Phone",     value: draftPhone, set: setDraftPhone, placeholder: "+92 300 0000000",   keyboard: "phone-pad" },
          ].map(({ label, value, set, placeholder, keyboard }) => (
            <View key={label} style={[styles.fieldBox, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>{label}</Text>
              <TextInput value={value} onChangeText={set} style={[styles.fieldInput, { color: C.text }]}
                placeholderTextColor={C.textMuted} placeholder={placeholder}
                keyboardType={keyboard as any} autoCapitalize="none" />
            </View>
          ))}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.purple }]} onPress={handleSaveProfile} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>
        {alertOverlay}
      </SafeAreaView>
    );
  }

  // ─── CHANGE PASSWORD ─────────────────────────────────────────────────────
  if (view === "changePassword") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => { setView("main"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwError(""); setPwSuccess(false); }} activeOpacity={0.7}>
            <Text style={{ fontSize: 15, color: C.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.text }]}>Change Password</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          {[
            { label: "Current password",      value: currentPw,  set: setCurrentPw },
            { label: "New password",           value: newPw,      set: setNewPw },
            { label: "Confirm new password",   value: confirmPw,  set: setConfirmPw },
          ].map(({ label, value, set }) => (
            <View key={label} style={[styles.fieldBox, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>{label}</Text>
              <TextInput value={value} onChangeText={set} secureTextEntry
                style={[styles.fieldInput, { color: C.text }]} placeholder="••••••••" placeholderTextColor={C.textMuted} />
            </View>
          ))}
          {!!pwError   && <View style={[styles.msgBox, { backgroundColor: "#FFE8E8", borderColor: "#FFB3B3" }]}><Text style={{ fontSize: 13, color: "#C0392B" }}>⚠ {pwError}</Text></View>}
          {pwSuccess   && <View style={[styles.msgBox, { backgroundColor: "#E8FFE8", borderColor: "#B3FFB3" }]}><Text style={{ fontSize: 13, color: "#27AE60" }}>✓ Password changed!</Text></View>}
          <Text style={{ fontSize: 12, color: C.textMuted, lineHeight: 18 }}>Must be at least 8 characters.</Text>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.purple }]} onPress={handleSavePassword} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Update password</Text>
          </TouchableOpacity>
        </ScrollView>
        {alertOverlay}
      </SafeAreaView>
    );
  }

  // ─── PRIVACY SETTINGS ────────────────────────────────────────────────────
  if (view === "privacy") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setView("main")} activeOpacity={0.7}>
            <Text style={{ fontSize: 15, color: C.purple }}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.text }]}>Privacy Settings</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <Text style={[styles.sectionLabel, { color: C.textSecondary, paddingHorizontal: 0 }]}>Data sharing preferences</Text>
          {[
            { id: "attendance", title: "Attendance only",       desc: "Only attendance data is visible to faculty." },
            { id: "academic",   title: "Full academic record",  desc: "Grades, attendance and transcript are shared." },
            { id: "none",       title: "Private (none)",        desc: "No academic data shared with anyone." },
          ].map(opt => (
            <TouchableOpacity key={opt.id}
              style={[styles.privacyOption, { backgroundColor: C.bgCard, borderColor: privacySetting === opt.id ? C.purple : C.border }]}
              onPress={() => updatePrivacySetting(opt.id as PrivacySetting)} activeOpacity={0.8}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.privacyTitle, { color: C.text }]}>{opt.title}</Text>
                <Text style={[styles.privacyDesc, { color: C.textSecondary }]}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, { borderColor: privacySetting === opt.id ? C.purple : C.border }]}>
                {privacySetting === opt.id && <View style={[styles.radioDot, { backgroundColor: C.purple }]} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.purple, marginTop: 8 }]}
            onPress={() => { setView("main"); cpAlert("Saved", "Privacy preference updated."); }} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save preference</Text>
          </TouchableOpacity>
        </ScrollView>
        {alertOverlay}
      </SafeAreaView>
    );
  }

  // ─── HELP & SUPPORT ──────────────────────────────────────────────────────
  if (view === "help") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setView("main")} activeOpacity={0.7}>
            <Text style={{ fontSize: 15, color: C.purple }}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.text }]}>Help & Support</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          {[
            { icon: "✉️", title: "Email support", detail: "support@university.edu.pk", sub: "Response within 24 hours" },
            { icon: "📞", title: "Helpdesk",      detail: "+92 51 111 128 128",        sub: "Mon–Fri, 9am–5pm" },
            { icon: "🏛️", title: "Visit office",  detail: "Registrar Office, Block A", sub: "Mohammad Ali Jinnah University" },
          ].map(item => (
            <View key={item.title} style={[styles.helpCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <Text style={styles.helpIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpTitle,  { color: C.text }]}>{item.title}</Text>
                <Text style={[styles.helpDetail, { color: C.purple }]}>{item.detail}</Text>
                <Text style={[styles.helpSub,    { color: C.textMuted }]}>{item.sub}</Text>
              </View>
            </View>
          ))}
          <Text style={[styles.sectionLabel, { color: C.textSecondary, paddingHorizontal: 0, paddingTop: 8 }]}>FAQs</Text>
          {[
            ["How do I view my attendance?",   "Go to the Attendance tab from the bottom navigation bar."],
            ["How is CGPA calculated?",        "CGPA is the average of all course grade points weighted by credit hours."],
            ["How to reset my password?",      "Go to Profile → Account → Change Password."],
            ["Where to find my fee voucher?",  "Go to Profile → Academic → Fee Invoice."],
          ].map(([q, a]) => (
            <TouchableOpacity key={q}
              style={[styles.faqRow, { backgroundColor: C.bgCard, borderColor: C.border }]}
              onPress={() => cpAlert(q as string, a as string)} activeOpacity={0.7}>
              <Text style={[styles.faqText, { color: C.text }]}>{q}</Text>
              <Text style={{ color: C.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {alertOverlay}
      </SafeAreaView>
    );
  }

  // ─── MAIN PROFILE ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.editBtn, { borderColor: C.purple }]} onPress={openEdit} activeOpacity={0.8}>
          <Text style={[styles.editBtnText, { color: C.purple }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { borderBottomColor: C.border }]}>
          <TouchableOpacity style={styles.avatar} onPress={openEdit} activeOpacity={0.8}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
          <Text style={[styles.profileName,  { color: C.text }]}>{profile.name}</Text>
          <Text style={[styles.profileSub,   { color: C.textSecondary }]}>BS Computer Science · Year 3</Text>
          <Text style={[styles.profileId,    { color: C.textMuted }]}>Student ID: 2022-CS-047</Text>
          <View style={[styles.profileStats, { backgroundColor: C.bgHighlight, borderColor: C.purpleBorder }]}>
            {[["3.6","CGPA"],["72","Credits"],["88%","Attendance"]].map(([val,label]) => (
              <View key={label} style={styles.profileStat}>
                <Text style={[styles.profileStatNum,   { color: C.purple }]}>{val}</Text>
                <Text style={[styles.profileStatLabel, { color: C.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Personal info</Text>
        <View style={[styles.group, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          {[["Name",profile.name],["Email",profile.email],["Phone",profile.phone]].map(([label,val],i,arr) => (
            <View key={label} style={[styles.row, i < arr.length-1 ? { borderBottomColor: C.border } : styles.rowLast]}>
              <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
              <Text style={[styles.rowVal,   { color: C.textSecondary }]}>{val}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Notifications</Text>
        <View style={[styles.group, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          {([
            ["Class reminders",      "classReminders"],
            ["15-min early reminder","earlyReminder"],
            ["Attendance alerts",    "attendanceAlerts"],
          ] as [string, keyof typeof settings][]).map(([label, key], i, arr) => (
            <View key={key} style={[styles.row, i < arr.length-1 ? { borderBottomColor: C.border } : styles.rowLast]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
                <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  {settings[key] ? "● Active" : "○ Off"}
                </Text>
              </View>
              <Switch value={settings[key]}
                onValueChange={(v) => { updateSetting(key, v); fireNotification(key, v); }}
                trackColor={{ false: "#ddd", true: "#AFA9EC" }}
                thumbColor={settings[key] ? "#534AB7" : "#fff"} />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Appearance</Text>
        <View style={[styles.group, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Dark mode</Text>
            <Switch value={settings.darkMode} onValueChange={(v) => updateSetting("darkMode", v)}
              trackColor={{ false: "#ddd", true: "#AFA9EC" }} thumbColor={settings.darkMode ? "#534AB7" : "#fff"} />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Academic</Text>
        <View style={[styles.group, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          <TouchableOpacity style={[styles.row, { borderBottomColor: C.border }]} onPress={() => router.push("/fee-invoice")} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Fee invoice</Text>
            <Text style={[styles.rowChev, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleDownloadTranscript} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Download transcript</Text>
            <Text style={[styles.rowChev, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Account</Text>
        <View style={[styles.group, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          <TouchableOpacity style={[styles.row, { borderBottomColor: C.border }]} onPress={() => setView("changePassword")} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Change password</Text>
            <Text style={[styles.rowChev, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomColor: C.border }]} onPress={() => setView("privacy")} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Privacy settings</Text>
            <Text style={[styles.rowChev, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={() => setView("help")} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Help & support</Text>
            <Text style={[styles.rowChev, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
        {/* ✅ FIX 4: logout bg uses theme color, not hardcoded white */}
        <View style={[styles.group, { borderColor: dark ? "#5C2020" : "#FFD0D0", backgroundColor: dark ? "#2A1010" : "#FFF5F5", marginBottom: 32 }]}>
          <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={[styles.rowLabel, { color: "#E24B4A" }]}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {alertOverlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1 },
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:20, paddingTop:16, paddingBottom:14, borderBottomWidth:0.5 },
  headerTitle:{ fontSize:20, fontWeight:"500" },
  editBtn:{ paddingHorizontal:14, paddingVertical:6, borderRadius:16, borderWidth:0.5 },
  editBtnText:{ fontSize:13, fontWeight:"500" },
  scroll:{ flex:1 },
  scrollContent:{ paddingBottom:32 },
  avatarCenter:{ alignItems:"center", marginBottom:8 },
  profileCard:{ alignItems:"center", padding:24, borderBottomWidth:0.5 },
  avatar:{ width:72, height:72, borderRadius:36, backgroundColor:"#AFA9EC", alignItems:"center", justifyContent:"center", marginBottom:12 },
  avatarText:{ fontSize:24, fontWeight:"500", color:"#26215C" },
  profileName:{ fontSize:20, fontWeight:"500", marginBottom:4 },
  profileSub:{ fontSize:14, marginBottom:2 },
  profileId:{ fontSize:12, marginBottom:20 },
  profileStats:{ flexDirection:"row", width:"100%", borderRadius:12, padding:16, justifyContent:"space-around", borderWidth:0.5 },
  profileStat:{ alignItems:"center" },
  profileStatNum:{ fontSize:20, fontWeight:"500" },
  profileStatLabel:{ fontSize:12, marginTop:2 },
  sectionLabel:{ fontSize:11, fontWeight:"500", textTransform:"uppercase", letterSpacing:0.8, paddingHorizontal:20, paddingTop:20, paddingBottom:8 },
  group:{ marginHorizontal:20, borderRadius:12, borderWidth:0.5, overflow:"hidden" },
  row:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5 },
  rowLast:{ borderBottomWidth:0 },
  rowLabel:{ fontSize:14 },
  rowVal:{ fontSize:14, maxWidth:"60%", textAlign:"right" },
  rowChev:{ fontSize:18 },
  fieldBox:{ borderRadius:10, borderWidth:0.5, padding:14 },
  fieldLabel:{ fontSize:11, textTransform:"uppercase", letterSpacing:0.6, marginBottom:4 },
  fieldInput:{ fontSize:15, paddingVertical:2 },
  saveBtn:{ paddingVertical:14, borderRadius:12, alignItems:"center", marginTop:8 },
  saveBtnText:{ fontSize:15, fontWeight:"500", color:"#fff" },
  msgBox:{ borderRadius:8, borderWidth:1, padding:12 },
  privacyOption:{ borderRadius:12, borderWidth:1, padding:16, flexDirection:"row", alignItems:"center", gap:12 },
  privacyTitle:{ fontSize:14, fontWeight:"500", marginBottom:2 },
  privacyDesc:{ fontSize:12, lineHeight:18 },
  radio:{ width:20, height:20, borderRadius:10, borderWidth:2, alignItems:"center", justifyContent:"center" },
  radioDot:{ width:10, height:10, borderRadius:5 },
  helpCard:{ borderRadius:12, borderWidth:0.5, padding:16, flexDirection:"row", alignItems:"flex-start", gap:14 },
  helpIcon:{ fontSize:24, marginTop:2 },
  helpTitle:{ fontSize:14, fontWeight:"500", marginBottom:2 },
  helpDetail:{ fontSize:13, marginBottom:2 },
  helpSub:{ fontSize:11 },
  faqRow:{ borderRadius:10, borderWidth:0.5, padding:14, flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  faqText:{ fontSize:13, flex:1, marginRight:8 },
  alertOverlay:{ flex:1, backgroundColor:"rgba(0,0,0,0.45)", justifyContent:"center", alignItems:"center", padding:40 },
  alertBox:{ borderRadius:14, borderWidth:0.5, overflow:"hidden", minWidth:270, maxWidth:400, width:"100%" },
  alertTitle:{ fontSize:17, fontWeight:"600", textAlign:"center", paddingTop:20, paddingHorizontal:16 },
  alertMessage:{ fontSize:13, textAlign:"center", paddingTop:6, paddingBottom:16, paddingHorizontal:16, lineHeight:18 },
  alertActions:{ flexDirection:"row", borderTopWidth:0.5 },
  alertBtn:{ flex:1, paddingVertical:14, alignItems:"center", justifyContent:"center" },
  alertBtnText:{ fontSize:15 },
});
