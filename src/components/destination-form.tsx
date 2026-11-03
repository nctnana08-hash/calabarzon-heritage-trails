import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useSaveDestination,
  type DestinationInput,
} from "@/hooks/use-destinations";
import {
  CATEGORIES,
  PROVINCES,
  imageUrl,
  slugify,
  type Destination,
} from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function friendlyError(message: string): string {
  if (message.includes("duplicate key")) {
    return "A destination with this link (slug) already exists — pick a different one.";
  }
  if (message.includes("destinations_province_check")) {
    return "Please choose one of the five CALABARZON provinces.";
  }
  return message;
}

export function DestinationForm({
  destination,
  onDone,
}: {
  destination?: Destination;
  onDone: () => void;
}) {
  const save = useSaveDestination();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    destination ? imageUrl(destination) : null,
  );
  const [values, setValues] = useState({
    name: destination?.name ?? "",
    slug: destination?.slug ?? "",
    slugTouched: !!destination,
    description: destination?.description ?? "",
    address: destination?.address ?? "",
    province: destination?.province ?? "",
    category: destination?.category ?? "",
    latitude: destination?.latitude != null ? String(destination.latitude) : "",
    longitude: destination?.longitude != null ? String(destination.longitude) : "",
    featured: destination?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  function onNameChange(name: string) {
    setValues((v) => ({
      ...v,
      name,
      slug: v.slugTouched ? v.slug : slugify(name),
    }));
  }

  function onFileChange(f: File | null) {
    setFile(f);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : destination ? imageUrl(destination) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.province || !values.category) {
      toast.error("Name, province, and category are required.");
      return;
    }
    setSaving(true);
    try {
      let imagePath = destination?.image_path ?? null;
      if (file) {
        const slug = values.slug.trim() || slugify(values.name);
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${slug}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("destination-images")
          .upload(path, file, {
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
        slug: values.slug.trim() || slugify(values.name),
        description: values.description.trim(),
        address: values.address.trim(),
        province: values.province,
        category: values.category,
        image_path: imagePath,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
        featured: values.featured,
      };

      await save.mutateAsync({ destination, input });
      toast.success(destination ? "Destination updated." : "Destination added.");
      onDone();
    } catch (err) {
      toast.error(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="dest-name">Name *</Label>
        <Input
          id="dest-name"
          value={values.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Rizal Shrine"
          required
        />
      </div>

      <div>
        <Label htmlFor="dest-slug">Link (slug)</Label>
        <Input
          id="dest-slug"
          value={values.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
          placeholder="rizal-shrine"
        />
      </div>

      <div>
        <Label htmlFor="dest-address">Address</Label>
        <Input
          id="dest-address"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, city, municipality"
        />
      </div>

      <div>
        <Label>Province *</Label>
        <Select value={values.province} onValueChange={(v) => set("province", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a province" />
          </SelectTrigger>
          <SelectContent>
            {PROVINCES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category *</Label>
        <Select value={values.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="dest-description">Description</Label>
        <Textarea
          id="dest-description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          placeholder="The story, history, and what visitors should look for…"
        />
      </div>

      <div>
        <Label htmlFor="dest-lat">Latitude</Label>
        <Input
          id="dest-lat"
          type="number"
          step="any"
          value={values.latitude}
          onChange={(e) => set("latitude", e.target.value)}
          placeholder="14.2115"
        />
      </div>

      <div>
        <Label htmlFor="dest-lng">Longitude</Label>
        <Input
          id="dest-lng"
          type="number"
          step="any"
          value={values.longitude}
          onChange={(e) => set("longitude", e.target.value)}
          placeholder="121.1614"
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="dest-image">Image</Label>
        <div className="flex items-center gap-4">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="size-20 rounded-md border border-border object-cover"
            />
          )}
          <Input
            id="dest-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="flex-1"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                onFileChange(null);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox
          id="dest-featured"
          checked={values.featured}
          onCheckedChange={(checked) => set("featured", checked === true)}
        />
        <Label htmlFor="dest-featured">Feature on the home screen</Label>
      </div>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : destination ? "Save changes" : "Add destination"}
        </Button>
      </div>
    </form>
  );
}
