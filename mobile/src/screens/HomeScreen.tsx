import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useNativeBranding } from "../lib/branding";
import { CALABARZON_NATIVE_DESTINATIONS, NativeDestination } from "../lib/destinations";

const PROVINCES = ["All", "Cavite", "Laguna", "Batangas", "Rizal", "Quezon"];

export function HomeScreen({
  onSelectPlace,
}: {
  onSelectPlace: (place: NativeDestination) => void;
}) {
  const { branding } = useNativeBranding();
  const [selectedProvince, setSelectedProvince] = useState("All");

  const filteredPlaces = CALABARZON_NATIVE_DESTINATIONS.filter((d) => {
    if (selectedProvince === "All") return true;
    return d.province === selectedProvince;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002366" />

      {/* Tricolor Ribbon Header */}
      <View style={styles.tricolorBar}>
        <View style={[styles.triSegment, { backgroundColor: "#0038A8" }]} />
        <View style={[styles.triSegment, { backgroundColor: "#FCD116" }]} />
        <View style={[styles.triSegment, { backgroundColor: "#CE1126" }]} />
      </View>

      {/* Dynamic App Bar */}
      <View style={styles.appBar}>
        <View style={styles.brandingRow}>
          {branding.customLogoUrl ? (
            <Image source={{ uri: branding.customLogoUrl }} style={styles.customLogo} />
          ) : (
            <View style={[styles.presetLogoBadge, { backgroundColor: branding.primaryColor }]}>
              <Text style={styles.presetLogoText}>☀️</Text>
            </View>
          )}

          <View style={styles.titleColumn}>
            <View style={styles.nameRow}>
              <Text style={[styles.appName, { color: branding.primaryColor }]}>
                {branding.appName}
              </Text>
              {branding.appBadge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{branding.appBadge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.appTagline}>{branding.appTagline}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* eGovPH Royal Blue Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: branding.primaryColor }]}>
          <Text style={styles.heroKicker}>REGION IV-A · OFFICIAL HERITAGE GUIDE</Text>
          <Text style={styles.heroTitle}>
            Explore CALABARZON. <Text style={{ color: "#FCD116" }}>Collect 360° Stamps.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Immersive virtual field trips to 19 national shrines, historic churches, and colonial
            monuments.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNumber}>19</Text>
              <Text style={styles.statLabel}>Sites</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Provinces</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statNumber}>16K</Text>
              <Text style={styles.statLabel}>Ultra 360°</Text>
            </View>
          </View>
        </View>

        {/* Province Filter Pills */}
        <Text style={styles.sectionHeading}>Browse by Province</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {PROVINCES.map((p) => {
            const active = selectedProvince === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedProvince(p)}
                style={[
                  styles.filterPill,
                  active && { backgroundColor: branding.primaryColor, borderColor: branding.primaryColor },
                ]}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Destination Cards */}
        <Text style={styles.sectionHeading}>Featured Heritage Destinations</Text>
        {filteredPlaces.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => onSelectPlace(item)}
            style={styles.card}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardProvince}>
                  {item.province.toUpperCase()} · {item.category}
                </Text>
                <View style={styles.badge360}>
                  <Text style={styles.badge360Text}>360° TOUR</Text>
                </View>
              </View>

              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardAddress}>📍 {item.address}</Text>
                <Text style={[styles.exploreLink, { color: branding.primaryColor }]}>Explore →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tricolorBar: {
    flexDirection: "row",
    height: 3,
    width: "100%",
  },
  triSegment: {
    flex: 1,
    height: "100%",
  },
  appBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  brandingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  presetLogoText: {
    fontSize: 20,
  },
  titleColumn: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  badgePill: {
    backgroundColor: "#CE1126",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  appTagline: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroKicker: {
    color: "#FCD116",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 6,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  heroStatsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "600",
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 22,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#E2E8F0",
  },
  cardBody: {
    padding: 14,
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardProvince: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0038A8",
  },
  badge360: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badge360Text: {
    color: "#0038A8",
    fontSize: 10,
    fontWeight: "800",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  cardAddress: {
    fontSize: 12,
    color: "#64748B",
  },
  exploreLink: {
    fontSize: 13,
    fontWeight: "800",
  },
});
