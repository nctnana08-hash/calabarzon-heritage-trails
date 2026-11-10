import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PlaceDetailScreen } from "./src/screens/PlaceDetailScreen";
import { PassportScreen } from "./src/screens/PassportScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { NativeDestination } from "./src/lib/destinations";
import { useNativeBranding } from "./src/lib/branding";

type TabName = "home" | "passport" | "settings";

export default function App() {
  const { branding } = useNativeBranding();
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [selectedPlace, setSelectedPlace] = useState<NativeDestination | null>(null);
  const [stampedPlaceIds, setStampedPlaceIds] = useState<Set<string>>(new Set(["1"])); // 1 pre-stamped as sample

  const handleStampCollected = (id: string) => {
    setStampedPlaceIds((prev) => new Set([...prev, id]));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Main Content Area */}
        <View style={styles.screenWrapper}>
          {selectedPlace ? (
            <PlaceDetailScreen
              place={selectedPlace}
              onBack={() => setSelectedPlace(null)}
              onStampCollected={handleStampCollected}
            />
          ) : (
            <>
              {activeTab === "home" && (
                <HomeScreen onSelectPlace={(place) => setSelectedPlace(place)} />
              )}
              {activeTab === "passport" && <PassportScreen stampedIds={stampedPlaceIds} />}
              {activeTab === "settings" && <SettingsScreen />}
            </>
          )}
        </View>

        {/* Bottom Tab Bar (hidden when inspecting place in 360) */}
        {!selectedPlace && (
          <View style={styles.bottomTabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab("home")}
              style={[styles.tabButton, activeTab === "home" && styles.tabButtonActive]}
            >
              <Text style={{ fontSize: 20 }}>🧭</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "home" && { color: branding.primaryColor, fontWeight: "800" },
                ]}
              >
                Explore
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("passport")}
              style={[styles.tabButton, activeTab === "passport" && styles.tabButtonActive]}
            >
              <Text style={{ fontSize: 20 }}>🛂</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "passport" && { color: branding.primaryColor, fontWeight: "800" },
                ]}
              >
                e-Passport ({stampedPlaceIds.size})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("settings")}
              style={[styles.tabButton, activeTab === "settings" && styles.tabButtonActive]}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "settings" && { color: branding.primaryColor, fontWeight: "800" },
                ]}
              >
                Branding
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#002366",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  screenWrapper: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
});
