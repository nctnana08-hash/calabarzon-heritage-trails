import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNativeBranding } from "../lib/branding";
import { CALABARZON_NATIVE_DESTINATIONS } from "../lib/destinations";

export function PassportScreen({
  stampedIds,
}: {
  stampedIds: Set<string>;
}) {
  const { branding } = useNativeBranding();
  const total = CALABARZON_NATIVE_DESTINATIONS.length;
  const collected = stampedIds.size;
  const pct = Math.round((collected / total) * 100);

  const handleClaimCertificate = () => {
    if (collected === 0) {
      Alert.alert(
        "Walang Stamp (No Stamps Yet)",
        "Visit heritage places and answer quizzes to collect arrival stamps before claiming your certificate!"
      );
      return;
    }
    Alert.alert(
      "🎖️ Sertipiko ng Pagkumpleto",
      `Binabati kita! Nakolekta mo ang ${collected} sa ${total} (${pct}%) opisyal na heritage stamps sa Rehiyon IV-A CALABARZON.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Passport Leather Header */}
      <View style={[styles.passportCover, { backgroundColor: branding.primaryColor }]}>
        <Text style={styles.coverEmblem}>🇵🇭</Text>
        <Text style={styles.coverTitle}>REPUBLIKA NG PILIPINAS</Text>
        <Text style={styles.coverSub}>PASAPORTE NG PAMANA · REGION IV-A</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {collected} of {total} Stamps Verified ({pct}%)
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Digital Arrival Stamps</Text>
          <TouchableOpacity onPress={handleClaimCertificate} style={styles.certBtn}>
            <Text style={styles.certBtnText}>Claim Certificate</Text>
          </TouchableOpacity>
        </View>

        {/* 19 Passport Stamps Grid */}
        <View style={styles.stampGrid}>
          {CALABARZON_NATIVE_DESTINATIONS.map((d) => {
            const hasStamp = stampedIds.has(d.id);
            return (
              <View
                key={d.id}
                style={[
                  styles.stampSlot,
                  hasStamp && { borderColor: "#0038A8", backgroundColor: "#EFF6FF" },
                ]}
              >
                <View style={styles.stampInner}>
                  <Text style={styles.stampIcon}>{hasStamp ? "💮" : "⚪"}</Text>
                  <Text style={styles.stampName} numberOfLines={2}>
                    {d.name}
                  </Text>
                  <Text style={styles.stampProvince}>{d.province}</Text>
                  <Text
                    style={[
                      styles.stampStatus,
                      hasStamp ? { color: "#16A34A" } : { color: "#94A3B8" },
                    ]}
                  >
                    {hasStamp ? "VERIFIED" : "UNVISITED"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  passportCover: {
    padding: 24,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  coverEmblem: {
    fontSize: 36,
    marginBottom: 6,
  },
  coverTitle: {
    color: "#FCD116",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  coverSub: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  progressContainer: {
    width: "100%",
    marginTop: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FCD116",
    borderRadius: 4,
  },
  progressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  certBtn: {
    backgroundColor: "#0038A8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  certBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  stampGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stampSlot: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 12,
    alignItems: "center",
  },
  stampInner: {
    alignItems: "center",
  },
  stampIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  stampName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  stampProvince: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  stampStatus: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
