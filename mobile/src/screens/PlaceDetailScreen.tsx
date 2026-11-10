import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Panorama360Viewer } from "../components/Panorama360Viewer";
import { NativeDestination } from "../lib/destinations";
import { useNativeBranding } from "../lib/branding";

export function PlaceDetailScreen({
  place,
  onBack,
  onStampCollected,
}: {
  place: NativeDestination;
  onBack: () => void;
  onStampCollected: (placeId: string) => void;
}) {
  const { branding } = useNativeBranding();
  const [show360, setShow360] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [stamped, setStamped] = useState(false);

  const handleSelectAnswer = (idx: number) => {
    if (quizAnswered) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);

    if (idx === place.quiz.correctIndex) {
      setStamped(true);
      onStampCollected(place.id);
      Alert.alert(
        "🎉 Tumpak! (Correct Answer)",
        `You answered correctly and earned the official ${place.name} Passport Stamp!`,
        [{ text: "Tingnan ang Pasaporte", onPress: () => {} }]
      );
    } else {
      Alert.alert(
        "Maling Sagot (Try Again)",
        "Review the history section above to find the correct answer and claim your stamp!"
      );
    }
  };

  if (show360) {
    return (
      <View style={styles.container}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setShow360(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Exit 360°</Text>
          </TouchableOpacity>
          <Text style={styles.viewerTitle} numberOfLines={1}>
            {place.name}
          </Text>
        </View>
        <Panorama360Viewer panoramaUrl={place.panoramaUrl} title={place.name} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Detail Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {place.name}
        </Text>
        {stamped ? (
          <View style={styles.stampedBadge}>
            <Text style={styles.stampedBadgeText}>✓ STAMPED</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image & 360 Banner Button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShow360(true)}
            style={styles.floating360Button}
          >
            <Text style={styles.floating360Text}>🌀 Launch 360° Virtual Tour</Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          <View style={styles.metaBadgeRow}>
            <Text style={[styles.metaBadge, { color: branding.primaryColor }]}>
              {place.province} · {place.category}
            </Text>
            <Text style={styles.coordsText}>
              {place.latitude.toFixed(4)}°N, {place.longitude.toFixed(4)}°E
            </Text>
          </View>

          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeAddress}>📍 {place.address}</Text>

          {/* Historical Narrative */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeading}>Kasaysayan at Pamana (Heritage Narrative)</Text>
            <Text style={styles.cardText}>{place.history}</Text>
          </View>

          {/* Cultural Knowledge Quiz */}
          <View style={styles.sectionCard}>
            <View style={styles.quizHeader}>
              <Text style={styles.cardHeading}>Field Quiz · Pagsusulit</Text>
              <Text style={styles.quizScoreTag}>Earn Digital Stamp</Text>
            </View>
            <Text style={styles.questionText}>{place.quiz.question}</Text>

            <View style={styles.optionsList}>
              {place.quiz.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = place.quiz.correctIndex === idx;
                let bg = "#F8FAFC";
                let borderColor = "#E2E8F0";

                if (quizAnswered) {
                  if (isCorrect) {
                    bg = "#ECFDF5";
                    borderColor = "#16A34A";
                  } else if (isSelected) {
                    bg = "#FEF2F2";
                    borderColor = "#EF4444";
                  }
                }

                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleSelectAnswer(idx)}
                    style={[styles.quizOption, { backgroundColor: bg, borderColor }]}
                  >
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                    <Text style={styles.optionLabel}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  stampedBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stampedBadgeText: {
    color: "#16A34A",
    fontSize: 10,
    fontWeight: "800",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#001033",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  viewerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
    backgroundColor: "#E2E8F0",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  floating360Button: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#0038A8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  floating360Text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  body: {
    padding: 16,
  },
  metaBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaBadge: {
    fontSize: 12,
    fontWeight: "800",
  },
  coordsText: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "monospace",
  },
  placeName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 4,
  },
  placeAddress: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "#334155",
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  quizScoreTag: {
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    fontSize: 10.5,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  quizOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
});
