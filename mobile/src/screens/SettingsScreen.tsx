import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNativeBranding, LogoPresetId } from "../lib/branding";

const PRESETS: Array<{ id: LogoPresetId; name: string; symbol: string }> = [
  { id: "sun", name: "Araw ng Kalayaan (Sun)", symbol: "☀️" },
  { id: "carabao", name: "Tamaraw Heritage", symbol: "🐃" },
  { id: "church", name: "Baroque Belfry", symbol: "⛪" },
  { id: "flag", name: "Philippine Crest", symbol: "🇵🇭" },
];

const COLORS = [
  { name: "Navy", hex: "#0038A8" },
  { name: "Royal", hex: "#1E3A8A" },
  { name: "Emerald", hex: "#065F46" },
  { name: "Crimson", hex: "#991B1B" },
  { name: "Slate", hex: "#0F172A" },
];

export function SettingsScreen() {
  const { branding, updateBranding, resetBranding } = useNativeBranding();

  const [name, setName] = useState(branding.appName);
  const [badge, setBadge] = useState(branding.appBadge);
  const [tagline, setTagline] = useState(branding.appTagline);
  const [logoUrl, setLogoUrl] = useState(branding.customLogoUrl || "");
  const [preset, setPreset] = useState<LogoPresetId>(branding.presetId);
  const [color, setColor] = useState(branding.primaryColor);

  const handleSave = () => {
    updateBranding({
      appName: name.trim() || "Sulyap",
      appBadge: badge.trim(),
      appTagline: tagline.trim() || "CALABARZON Heritage Portal",
      logoType: logoUrl.trim() ? "custom" : "preset",
      customLogoUrl: logoUrl.trim() || null,
      presetId: preset,
      primaryColor: color,
    });
    Alert.alert("✅ Branding Na-save!", "Ang pangalan at logo ay live na ipinapakita sa buong app.");
  };

  const handleReset = () => {
    resetBranding();
    setName("Sulyap");
    setBadge("PH");
    setTagline("CALABARZON Heritage Portal");
    setLogoUrl("");
    setPreset("sun");
    setColor("#0038A8");
    Alert.alert("Naibalik sa Default", "Bumalik sa orihinal na Sulyap branding.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenHeading}>App Customization &amp; Branding</Text>
      <Text style={styles.screenSub}>
        I-customize ang pangalan ng app, thumbnail logo, at tema. Agad itong makikita sa navigation
        bar at mga screens.
      </Text>

      {/* Live Preview Card */}
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>LIVE HEADER PREVIEW</Text>
        <View style={styles.previewHeader}>
          <View style={[styles.previewLogo, { backgroundColor: color }]}>
            <Text style={{ fontSize: 18 }}>
              {logoUrl ? "🖼️" : PRESETS.find((p) => p.id === preset)?.symbol || "☀️"}
            </Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.previewName, { color }]}>{name || "App Name"}</Text>
              {badge ? (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.previewTagline} numberOfLines={1}>
              {tagline || "Tagline"}
            </Text>
          </View>
        </View>
      </View>

      {/* Input Form */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>PANGALAN NG APP (APP NAME)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sulyap, Lakbay Kultura"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>BADGE / SUFFIX</Text>
        <TextInput
          value={badge}
          onChangeText={setBadge}
          placeholder="e.g. PH, 2026, GOV"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>TAGLINE / SUBTITLE</Text>
        <TextInput
          value={tagline}
          onChangeText={setTagline}
          placeholder="e.g. CALABARZON Heritage Portal"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>PUMILI NG HERITAGE EMBLEM</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((p) => {
            const isSelected = preset === p.id && !logoUrl;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setPreset(p.id);
                  setLogoUrl("");
                }}
                style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
              >
                <Text style={{ fontSize: 20 }}>{p.symbol}</Text>
                <Text style={styles.presetText}>{p.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>O MAGLAGAY NG CUSTOM IMAGE URL</Text>
        <TextInput
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://example.com/logo.png"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>KULAY NG TEMA (THEME COLOR)</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => {
            const isSelected = color === c.hex;
            return (
              <TouchableOpacity
                key={c.hex}
                onPress={() => setColor(c.hex)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c.hex },
                  isSelected && styles.colorCircleActive,
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: color }]}>
          <Text style={styles.saveBtnText}>✓ I-save ang Branding</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Ibalik sa Orihinal na Sulyap Defaults</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  screenSub: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewName: {
    fontSize: 17,
    fontWeight: "900",
  },
  previewBadge: {
    backgroundColor: "#CE1126",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  previewBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  previewTagline: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    width: "48%",
  },
  presetBtnActive: {
    borderColor: "#0038A8",
    backgroundColor: "#EFF6FF",
  },
  presetText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: "#FCD116",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  resetBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  resetBtnText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
});
