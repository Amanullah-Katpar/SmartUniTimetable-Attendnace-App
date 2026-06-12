import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert, KeyboardAvoidingView, Platform,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password — shows inline reset form instead of Alert.prompt
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  function handleLogin() {
    if (!studentId || !password) {
      if (Platform.OS === "web") {
        window.alert("Error\n\nPlease enter your student ID and password.");
      } else {
        Alert.alert("Error", "Please enter your student ID and password.");
      }
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (
        (studentId === "2022-CS-047" || studentId === "fa23bscs0087") &&
        (password === "password" || password === "aman786?")
      ) {
        router.replace("/(tabs)");
      } else {
        if (Platform.OS === "web") {
          window.alert("Login failed\n\nInvalid credentials.\n\nTry:\n• fa23bscs0087 / aman786?\n• 2022-CS-047 / password");
        } else {
          Alert.alert("Login failed", "Invalid credentials.\n\nTry:\n• fa23bscs0087 / aman786?\n• 2022-CS-047 / password");
        }
      }
    }, 1000);
  }

  function handleSendReset() {
    if (!resetEmail.trim()) {
      if (Platform.OS === "web") {
        window.alert("Please enter your email address.");
      } else {
        Alert.alert("Error", "Please enter your email address.");
      }
      return;
    }
    setResetSent(true);
  }

  // ── Forgot password inline form ─────────────────────────────────────────
  if (showReset) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SU</Text>
            </View>
            <Text style={styles.appName}>Reset Password</Text>
            <Text style={styles.appSub}>Enter your registered email address</Text>
          </View>

          {resetSent ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Reset link sent!</Text>
              <Text style={styles.successDesc}>
                Check your inbox at{"\n"}
                <Text style={{ fontWeight: "500" }}>{resetEmail}</Text>
              </Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }} activeOpacity={0.8}>
                <Text style={styles.loginBtnText}>Back to login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  style={styles.input}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={styles.loginBtn} onPress={handleSendReset} activeOpacity={0.8}>
                <Text style={styles.loginBtnText}>Send reset link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotRow} onPress={() => { setShowReset(false); setResetEmail(""); }} activeOpacity={0.7}>
                <Text style={styles.forgotText}>‹ Back to login</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Login form ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SU</Text>
          </View>
          <Text style={styles.appName}>Smart University</Text>
          <Text style={styles.appSub}>Attendance & Timetable</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student ID</Text>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. fa23bscs0087"
              placeholderTextColor="#bbb"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.showBtn} activeOpacity={0.7}>
                <Text style={styles.showBtnText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowReset(true)} style={styles.forgotRow} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{loading ? "Signing in..." : "Sign in"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Having trouble? Contact{"\n"}support@university.edu.pk</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PURPLE = "#534AB7";
const BORDER = "rgba(0,0,0,0.1)";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  kav: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logoArea: { alignItems: "center", marginBottom: 40 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  logoText: { fontSize: 24, fontWeight: "500", color: "#fff" },
  appName: { fontSize: 22, fontWeight: "500", color: "#111", marginBottom: 4 },
  appSub: { fontSize: 14, color: "#888" },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "500", color: "#888", textTransform: "uppercase", letterSpacing: 0.6 },
  input: { borderWidth: 0.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111" },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 0.5, borderColor: BORDER, borderRadius: 10 },
  showBtn: { paddingHorizontal: 14 },
  showBtnText: { fontSize: 13, color: PURPLE },
  forgotRow: { alignItems: "flex-end" },
  forgotText: { fontSize: 13, color: PURPLE },
  loginBtn: { backgroundColor: PURPLE, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 15, fontWeight: "500", color: "#fff" },
  footer: { textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 40, lineHeight: 18 },
  successBox: { alignItems: "center", gap: 12 },
  successIcon: { fontSize: 48, color: PURPLE },
  successTitle: { fontSize: 20, fontWeight: "500", color: "#111" },
  successDesc: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 22 },
});
