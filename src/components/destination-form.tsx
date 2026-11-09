import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSaveDestination, type DestinationInput } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES, imageUrl, slugify, type Destination } from "@/lib/destinations";
import { getEnrichment, saveCustomMeta } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Chip, Label } from "./sulyap-ui";

function friendlyError(message: string): string {
  if (message.includes("duplicate key")) {
    return "A place with this link (slug) already exists. Change the name or slug slightly.";
  }
  if (message.includes("destinations_province_check")) {
    return "Choose one of the five CALABARZON provinces.";
  }
  return message;
}

export function DestinationForm({
  destination,
  onDone,
}: {
  destination?: Destination | undefined;
  onDone: () => void;
}) {
  const save = useSaveDestination();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingEnrichment = destination ? getEnrichment(destination) : null;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(destination ? imageUrl(destination) : null);
  const [extraImages, setExtraImages] = useState<string[]>(existingEnrichment?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState({
    name: destination?.name ?? "",
    slug: destination?.slug ?? "",
    slugTouched: !!destination,
    description: destination?.description ?? "",
    history: existingEnrichment?.history ?? "",
    significance: existingEnrichment?.significance ?? "",
    sources: existingEnrichment?.sources ?? "",
    address: destination?.address ?? "",
    province: destination?.province ?? "Laguna",
    category: destination?.category ?? "Historical Shrines",
    latitude: destination?.latitude != null ? String(destination.latitude) : "",
    longitude: destination?.longitude != null ? String(destination.longitude) : "",
    featured: destination?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  function onNameChange(name: string) {
    setValues((v) => ({
      ...v,
      name,
      slug: v.slugTouched ? v.slug : slugify(name),
    }));
    if (errors["name"]) {
      setErrors((e) => {
        const next = { ...e };
        delete next.name;
        return next;
      });
    }
  }

  function onFileChange(f: File | null) {
    setFile(f);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : destination ? imageUrl(destination) : null);
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setErrors((e) => ({
        ...e,
        urlInput: "Paste a full image link that starts with http:// or https://.",
      }));
      return;
    }
    setExtraImages((imgs) => [...imgs, trimmed]);
    setUrlInput("");
    setErrors((e) => {
      const next = { ...e };
      delete next.urlInput;
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const trimmedName = values.name.trim();
    const trimmedAddr = values.address.trim();

    if (!trimmedName) {
      nextErrors["name"] = "Name is required. Enter the heritage site's name.";
    } else if (trimmedName.length > 80) {
      nextErrors["name"] = `Name must be 80 characters or fewer (currently ${trimmedName.length}).`;
    }

    if (!trimmedAddr) {
      nextErrors["address"] = "Address is required. Enter the street, barangay, or municipality.";
    }

    if (values.latitude.trim()) {
      const lat = Number(values.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        nextErrors["latitude"] = "Latitude must be a number between -90 and 90.";
      }
    }

    if (values.longitude.trim()) {
      const lng = Number(values.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        nextErrors["longitude"] = "Longitude must be a number between -180 and 180.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const finalSlug = values.slug.trim() || slugify(values.name);
      let imagePath = destination?.image_path ?? null;

      if (file) {
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${finalSlug}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("destination-images").upload(path, file, {
          upsert: true,
          contentType: file.type || "image/jpeg",
        });
        if (error) throw new Error(error.message);
        if (imagePath && imagePath !== path) {
          await supabase.storage
            .from("destination-images")
            .remove([imagePath])
            .catch(() => {});
        }
        imagePath = path;
      }

      const input: DestinationInput = {
        name: values.name.trim(),
        slug: finalSlug,
        description: values.description.trim(),
        address: values.address.trim(),
        province: values.province,
        category: values.category,
        image_path: imagePath,
        latitude: values.latitude.trim() ? Number(values.latitude) : null,
        longitude: values.longitude.trim() ? Number(values.longitude) : null,
        featured: values.featured,
        history: values.history.trim(),
        significance: values.significance.trim(),
        sources: values.sources.trim(),
        gallery_urls: extraImages,
      };

      const savedId = await save.mutateAsync({ destination, input });

      saveCustomMeta(finalSlug, {
        history: values.history.trim(),
        significance: values.significance.trim(),
        sources: values.sources.trim(),
        images: extraImages,
      });
      if (savedId) {
        saveCustomMeta(savedId, {
          history: values.history.trim(),
          significance: values.significance.trim(),
          sources: values.sources.trim(),
          images: extraImages,
        });
      }

      toast.success(destination ? "Visa dossier updated." : "New heritage site registered.");
      onDone();
    } catch (err) {
      toast.error(friendlyError(err instanceof Error ? err.message : "Could not save this place."));
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: F.body,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.card,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: "9px 12px",
    width: "100%",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Name */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>SITE NAME (MAX 80 CHARACTERS) *</Label>
          <span className="text-[11px]" style={{ fontFamily: F.mono, color: C.mute }}>
            {values.name.trim().length}/80
          </span>
        </div>
        <input
          id="dest-name"
          type="text"
          maxLength={85}
          value={values.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Taal Basilica"
          style={{
            ...inputStyle,
            borderColor: errors["name"] ? C.red : "#CBD5E1",
          }}
        />
        {errors["name"] ? (
          <p className="mt-1 text-[12px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
            {errors["name"]}
          </p>
        ) : null}
      </div>

      {/* Address */}
      <div>
        <Label className="mb-1.5">MUNICIPALITY / ADDRESS *</Label>
        <input
          id="dest-address"
          type="text"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, town, province"
          style={{
            ...inputStyle,
            borderColor: errors["address"] ? C.red : "#CBD5E1",
          }}
        />
        {errors["address"] ? (
          <p className="mt-1 text-[12px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
            {errors["address"]}
          </p>
        ) : null}
      </div>

      {/* Province Chips */}
      <div>
        <Label className="mb-2">PROVINCIAL SECTOR</Label>
        <div className="flex flex-wrap gap-2">
          {PROVINCES.map((p) => (
            <Chip
              key={p}
              label={p}
              color={C.cover}
              on={values.province === p}
              onClick={() => set("province", p)}
            />
          ))}
        </div>
      </div>

      {/* Category Chips */}
      <div>
        <Label className="mb-2">STAMP SEAL CLASSIFICATION</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const meta = getCategoryMeta(c);
            return (
              <Chip
                key={c}
                label={`${meta.fil} · ${meta.code}`}
                color={meta.deep}
                on={values.category === c}
                onClick={() => set("category", c)}
              />
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="mb-1.5">CURATORIAL OVERVIEW (STOP 01)</Label>
        <textarea
          id="dest-description"
          rows={3}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What is this place?"
          style={inputStyle}
        />
      </div>

      {/* History (Kasaysayan) */}
      <div>
        <Label className="mb-1.5">HISTORICAL RECORD / KASAYSAYAN (STOP 02)</Label>
        <textarea
          id="dest-history"
          rows={3}
          value={values.history}
          onChange={(e) => set("history", e.target.value)}
          placeholder="How did it come to be?"
          style={inputStyle}
        />
      </div>

      {/* Cultural Significance (Kahalagahan) */}
      <div>
        <Label className="mb-1.5">CULTURAL SIGNIFICANCE / KAHALAGAHAN (STOP 03)</Label>
        <textarea
          id="dest-significance"
          rows={3}
          value={values.significance}
          onChange={(e) => set("significance", e.target.value)}
          placeholder="Why does it matter to Filipinos today?"
          style={inputStyle}
        />
      </div>

      {/* Sources (Mga Sanggunian) */}
      <div>
        <Label className="mb-1.5">ARCHIVAL SOURCES (MGA SANGGUNIAN)</Label>
        <input
          id="dest-sources"
          type="text"
          value={values.sources}
          onChange={(e) => set("sources", e.target.value)}
          placeholder="e.g. NHCP Historical Marker; National Museum of the Philippines"
          style={inputStyle}
        />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5">LATITUDE (-90 TO 90)</Label>
          <input
            id="dest-lat"
            type="number"
            step="any"
            value={values.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            placeholder="14.2115"
            style={{
              ...inputStyle,
              borderColor: errors["latitude"] ? C.red : "#CBD5E1",
            }}
          />
          {errors["latitude"] ? (
            <p className="mt-1 text-[12px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
              {errors["latitude"]}
            </p>
          ) : null}
        </div>
        <div>
          <Label className="mb-1.5">LONGITUDE (-180 TO 180)</Label>
          <input
            id="dest-lng"
            type="number"
            step="any"
            value={values.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            placeholder="121.1614"
            style={{
              ...inputStyle,
              borderColor: errors["longitude"] ? C.red : "#CBD5E1",
            }}
          />
          {errors["longitude"] ? (
            <p className="mt-1 text-[12px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
              {errors["longitude"]}
            </p>
          ) : null}
        </div>
      </div>

      {/* Photos (Upload + Image URL Links) */}
      <div>
        <Label className="mb-2">ARCHIVAL PHOTOGRAPHS (FIRST IMAGE IS PRIMARY PLATE)</Label>
        {(preview || extraImages.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-3">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Cover preview"
                  className="size-20 rounded-xs border border-[#CBD5E1] object-cover"
                />
                {file && (
                  <button
                    type="button"
                    aria-label="Remove uploaded photo"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      onFileChange(null);
                    }}
                    className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{
                      backgroundColor: C.red,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : null}

            {extraImages.map((u, idx) => (
              <div key={u + idx} className="relative">
                <img
                  src={u}
                  alt={`Gallery ${idx + 1}`}
                  className="size-20 rounded-xs border border-[#CBD5E1] object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove photo link"
                  onClick={() => setExtraImages((imgs) => imgs.filter((_, j) => j !== idx))}
                  className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{
                    backgroundColor: C.red,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          id="dest-image"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <Btn
          label="Upload Photograph File"
          color={C.card}
          onClick={() => fileInputRef.current?.click()}
        />

        <div className="mt-3">
          <Label className="mb-1.5">OR PASTE AN EXTERNAL IMAGE URL (HTTP / HTTPS)</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errors["urlInput"]) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.urlInput;
                    return next;
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="https://..."
              style={{
                ...inputStyle,
                borderColor: errors["urlInput"] ? C.red : "#CBD5E1",
              }}
            />
            <div className="shrink-0 sm:w-36">
              <Btn label="Add Image" color={C.card} onClick={addUrl} />
            </div>
          </div>
          {errors["urlInput"] ? (
            <p className="mt-1 text-[12px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
              {errors["urlInput"]}
            </p>
          ) : null}
        </div>
      </div>

      {/* Featured Toggle */}
      <label className="flex cursor-pointer items-center gap-2.5 pt-1">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="size-4 accent-[#0038A8]"
        />
        <span className="text-[13px] font-semibold" style={{ fontFamily: F.body, color: C.ink }}>
          Feature on Home screen
        </span>
      </label>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
        <Btn label="Cancel" color={C.card} onClick={onDone} />
        <Btn
          type="submit"
          label={saving ? "Saving..." : "Save Place"}
          color={C.cover}
          disabled={saving}
        />
      </div>
    </form>
  );
}
