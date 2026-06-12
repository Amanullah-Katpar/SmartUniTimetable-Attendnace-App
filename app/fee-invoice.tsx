import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext, useTheme } from "./context/AppContext";

export default function FeeInvoiceScreen() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const { profile } = useAppContext();
  const C = colors;
  const [downloading, setDownloading] = useState(false);

  function buildText() {
    return [
      "MOHAMMAD ALI JINNAH UNIVERSITY",
      "FEE VOUCHER",
      "=".repeat(44),
      `Student Name : ${profile.name}`,
      `Student ID   : FA23-BSCS-0087`,
      `Email        : ${profile.email}`,
      `Phone        : ${profile.phone}`,
      `Program      : BS (Hons) Computer Science`,
      `Semester     : 6 (Spring 2025)`,
      "=".repeat(44),
      "FEE BREAKDOWN",
      "-".repeat(44),
      "Tuition Fee (6x12,000) :   72,000 PKR",
      "Laboratory Fee         :    5,000 PKR",
      "Library Fee            :    2,000 PKR",
      "Student Activity Fund  :    1,500 PKR",
      "Examination Fee        :    2,500 PKR",
      "-".repeat(44),
      "TOTAL AMOUNT DUE       :   83,000 PKR",
      "=".repeat(44),
      "Bank: HBL 123-456-789 | Code: HBLPKK",
      "Due Date: 31 May 2025",
      "=".repeat(44),
      "Mohammad Ali Jinnah University, Karachi.",
    ].join("\n");
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      if (Platform.OS === "web") {
        const blob = new Blob([buildText()], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `Fee_Invoice_${profile.name.replace(/\s+/g, "_")}_S6_2025.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.alert("Downloaded!\n\nFee invoice saved to your Downloads folder.");
      } else {
        await Share.share({
          message: buildText(),
          title: `Fee Invoice - ${profile.name}`,
        });
      }
    } catch (e: any) {
      if (e?.message !== "User did not share") {
        Alert.alert("Error", "Could not export the invoice.");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)/profile")} activeOpacity={0.7}>
          <Text style={{ fontSize: 16, color: C.purple }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>Fee Invoice</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.invoice, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.invoiceHeader}>
            <Text style={[styles.universityName, { color: C.text }]}>MOHAMMAD ALI JINNAH UNIVERSITY</Text>
            <Text style={[styles.invoiceTitle, { color: C.purple }]}>FEE VOUCHER</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.studentInfo}>
            {[
              ["Student Name", profile.name],
              ["Student ID",   "FA23-BSCS-0087"],
              ["Email",        profile.email],
              ["Phone",        profile.phone],
              ["Program",      "BS (Hons) Computer Science"],
              ["Semester",     "Semester 6 (Spring 2025)"],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: C.text }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.feeBreakdown}>
            <Text style={[styles.breakdownTitle, { color: C.text }]}>Fee Breakdown</Text>
            {[
              ["Tuition Fee (6 × 12,000 PKR)", "72,000"],
              ["Laboratory Fee",               "5,000"],
              ["Library Fee",                  "2,000"],
              ["Student Activity Fund",        "1,500"],
              ["Examination Fee",              "2,500"],
            ].map(([item, amt]) => (
              <View key={item} style={styles.feeRow}>
                <Text style={[styles.feeItem,   { color: C.text }]}>{item}</Text>
                <Text style={[styles.feeAmount, { color: C.text }]}>{amt} PKR</Text>
              </View>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel,  { color: C.text }]}>Total Amount Due</Text>
            <Text style={[styles.totalAmount, { color: C.purple }]}>83,000 PKR</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentTitle, { color: C.text }]}>Payment Details</Text>
            <Text style={[styles.paymentText,  { color: C.textSecondary }]}>Due Date: 31 May 2025</Text>
            <Text style={[styles.paymentText,  { color: C.textSecondary }]}>Bank Account: HBL 123-456-789</Text>
            <Text style={[styles.paymentText,  { color: C.textSecondary }]}>Bank Code: HBLPKK</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <Text style={[styles.footer, { color: C.textMuted }]}>
            Official fee voucher — Finance Office, Mohammad Ali Jinnah University.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.downloadBtn, { backgroundColor: C.purple, opacity: downloading ? 0.7 : 1 }]}
          onPress={handleDownload} activeOpacity={0.8} disabled={downloading}>
          <Text style={styles.downloadBtnText}>
            {downloading ? "Exporting…" : "📤  Save / Share Invoice"}
          </Text>
        </TouchableOpacity>

        {Platform.OS !== "web" && (
          <View style={[styles.hintBox, { backgroundColor: C.bgHighlight, borderColor: C.purpleBorder }]}>
            <Text style={[styles.hintText, { color: C.textSecondary }]}>
              💡 After tapping the button above, select{" "}
              <Text style={{ fontWeight: "600", color: C.text }}>"Save to Files"</Text>
              {" "}or{" "}
              <Text style={{ fontWeight: "600", color: C.text }}>"Save to device"</Text>
              {" "}to download the invoice to your phone.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 16, fontWeight: "500" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  invoice: { borderRadius: 12, borderWidth: 0.5, padding: 20, marginBottom: 16 },
  invoiceHeader: { alignItems: "center", marginBottom: 16 },
  universityName: { fontSize: 12, fontWeight: "500", textAlign: "center", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  invoiceTitle: { fontSize: 20, fontWeight: "500", textAlign: "center" },
  divider: { height: 0.5, marginVertical: 12 },
  studentInfo: { gap: 8, marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 13, fontWeight: "500", textAlign: "right", flex: 1, marginLeft: 8 },
  feeBreakdown: { marginBottom: 4 },
  breakdownTitle: { fontSize: 13, fontWeight: "500", marginBottom: 10 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  feeItem: { fontSize: 12, flex: 1 },
  feeAmount: { fontSize: 12, fontWeight: "500" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: "500" },
  totalAmount: { fontSize: 18, fontWeight: "500" },
  paymentInfo: { gap: 4, marginBottom: 4 },
  paymentTitle: { fontSize: 12, fontWeight: "500", marginBottom: 6 },
  paymentText: { fontSize: 12, lineHeight: 18 },
  footer: { fontSize: 11, textAlign: "center", lineHeight: 16, fontStyle: "italic" },
  downloadBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  downloadBtnText: { fontSize: 15, fontWeight: "500", color: "#fff" },
  hintBox: { borderRadius: 10, borderWidth: 0.5, padding: 14 },
  hintText: { fontSize: 13, lineHeight: 20 },
});
