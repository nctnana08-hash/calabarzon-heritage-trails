import { useMemo, useState } from "react";
import {
  Compass,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Upload,
  DoorOpen,
  HelpCircle,
  X,
  RotateCcw,
  Info,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  type PanoramaTour,
  type PanoramaScene,
  type PanoramaHotspot,
  type PanoramaArtwork,
  type PanoramaHotspotKind,
  validatePanoramaDimensions,
  generatePanoramaPreview,
  convertDynamicTourToKrpanoScenes,
  uploadPanoramaAssets,
  uploadArtworkImage,
  panoramaAssetUrl,
} from "@/lib/panorama-builder";
import { usePanoramaTours } from "@/hooks/use-panorama-builder";
import { useDestinations } from "@/hooks/use-destinations";
import { KrpanoViewer } from "@/components/krpano-viewer";
import { Pop, Mark, Btn, Label } from "@/components/sulyap-ui";
import { C, F } from "@/lib/sulyap-theme";
import { getQuestionsForDestination, type QuizQuestion } from "@/lib/sulyap-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const PRESET_PANORAMAS = [
  {
    label: "16K Grand Heritage Pavilion (16,000 × 8,000)",
    url: "/panoramas/calabarzon-grand-pavilion-16k.jpg",
    previewUrl: "/panoramas/tiles/grand16k/preview.webp",
    width: 16000,
    height: 8000,
    isUltraHd16k: true,
  },
  {
    label: "12K Bahay na Bato Salon (12,000 × 6,000)",
    url: "/panoramas/calabarzon-heritage-salon-12k.jpg",
    previewUrl: "/panoramas/tiles/salon12k/preview.webp",
    width: 12000,
    height: 6000,
    isUltraHd12k: true,
  },
  {
    label: "12K Upstairs Heritage Mezzanine (12,000 × 6,000)",
    url: "/panoramas/calabarzon-upstairs-mezzanine-12k.jpg",
    previewUrl: "/panoramas/tiles/upstairs12k/preview.webp",
    width: 12000,
    height: 6000,
    isUltraHd12k: true,
  },
  {
    label: "6K Museum Rotunda (6,000 × 3,000)",
    url: "/panoramas/museum-rotunda-360.jpg",
    previewUrl: "/panoramas/tiles/rotunda/preview.webp",
    width: 6000,
    height: 3000,
  },
];

export function PanoramaTourBuilder({
  initialDestinationSlug,
}: { initialDestinationSlug?: string | undefined } = {}) {
  const { tours, loading, saveTour, deleteTour } = usePanoramaTours();
  const { data: destinations = [] } = useDestinations();

  // Selected tour being edited (null = list mode)
  const [activeTour, setActiveTour] = useState<PanoramaTour | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string>("");

  // Visual marker placement mode
  const [pinMode, setPinMode] = useState<boolean>(false);
  const [editingHotspot, setEditingHotspot] = useState<Partial<PanoramaHotspot> | null>(null);
  const [hotspotModalOpen, setHotspotModalOpen] = useState(false);

  // New Scene modal
  const [newSceneModalOpen, setNewSceneModalOpen] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [newSceneLabel, setNewSceneLabel] = useState("");
  const [newScenePanoUrl, setNewScenePanoUrl] = useState(PRESET_PANORAMAS[0]?.url || "");
  const [newScenePreviewUrl, setNewScenePreviewUrl] = useState(
    PRESET_PANORAMAS[0]?.previewUrl || "",
  );
  const [newSceneFile, setNewSceneFile] = useState<File | null>(null);
  const [isPreparingPanorama, setIsPreparingPanorama] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [uploadValidation, setUploadValidation] = useState<string | null>(null);
  const [uploadValidationIsValid, setUploadValidationIsValid] = useState<boolean | null>(null);
  const [artworkUploadStage, setArtworkUploadStage] = useState<string | null>(null);

  // Quick helper to start a new tour
  const handleCreateNewTour = () => {
    const defaultDest =
      destinations.find((destination) => destination.slug === initialDestinationSlug)?.slug ??
      destinations[0]?.slug ??
      "aguinaldo-shrine";
    const initialSceneId = crypto.randomUUID();
    const newTour: PanoramaTour = {
      id: crypto.randomUUID(),
      destination_slug: defaultDest,
      title: "New Heritage 360° Virtual Tour",
      description: "Interactive multi-room cultural walk-through with annotated artwork markers.",
      cover_image_path: null,
      status: "draft",
      created_by: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scenes: [],
    };
    setActiveTour(newTour);
    setActiveSceneId(initialSceneId);
    setNewSceneModalOpen(true);
  };

  const currentScene = useMemo(() => {
    if (!activeTour || !activeTour.scenes) return null;
    return activeTour.scenes.find((s) => s.id === activeSceneId) || activeTour.scenes[0] || null;
  }, [activeTour, activeSceneId]);

  // Convert current tour to Krpano scenes for live preview
  const krpanoScenes = useMemo(() => {
    if (!activeTour) return [];
    return convertDynamicTourToKrpanoScenes(activeTour);
  }, [activeTour]);

  // Handle click on the 360 canvas when in Pin Placement mode
  const handleCanvasClick = (coords: { ath: number; atv: number }) => {
    if (!pinMode || !currentScene) return;

    // Open marker modal with captured coordinates
    setEditingHotspot({
      id: crypto.randomUUID(),
      scene_id: currentScene.id,
      hotspot_type: "art",
      title: "New Heritage Marker",
      subtitle: "Click to inspect details",
      bearing: coords.ath,
      pitch: coords.atv,
      display_order: (currentScene.hotspots?.length || 0) + 1,
      metadata: {
        badge: "🏛️",
        fov: 52,
      },
      artwork: {
        id: crypto.randomUUID(),
        scene_id: currentScene.id,
        title: "Masterwork Title",
        filipino_title: "",
        artist: "Filipino Master Artisan",
        historical_period: "Spanish Colonial / Heritage Era",
        medium: "Oil on canvas / Polychrome Wood",
        dimensions: "Framed Display",
        description: "Enter detailed curatorial description of the historical artifact here.",
        historical_significance: "Significant cultural artifact from Region IV-A CALABARZON.",
        conservation_notes: "Preserved under standard museum conditions.",
        image_path: "",
        display_order: 1,
        status: "published",
      },
    });
    setHotspotModalOpen(true);
    setPinMode(false); // disable placement mode after clicking
  };

  // Save the hotspot into the active tour
  const handleSaveHotspot = () => {
    if (!editingHotspot || !activeTour || !currentScene) return;

    if (editingHotspot.hotspot_type === "info") {
      const questions = editingHotspot.metadata?.quizQuestions ?? [];
      if (
        questions.length === 0 ||
        questions.some(
          (question) =>
            !question.q.trim() ||
            question.options.some((option) => !option.trim()) ||
            !question.explanation.trim(),
        )
      ) {
        toast.error(
          "Finish every quiz question, all four choices, and its explanation before saving.",
        );
        return;
      }
    }

    const fullHotspot: PanoramaHotspot = {
      id: editingHotspot.id || crypto.randomUUID(),
      scene_id: currentScene.id,
      hotspot_type: editingHotspot.hotspot_type || "art",
      title: editingHotspot.title || "Heritage Marker",
      subtitle: editingHotspot.subtitle || "",
      bearing: Number(editingHotspot.bearing) || 0,
      pitch: Number(editingHotspot.pitch) || 0,
      target_scene_id: editingHotspot.target_scene_id ?? null,
      display_order: editingHotspot.display_order || 1,
      metadata: editingHotspot.metadata || {},
      artwork: editingHotspot.hotspot_type === "art" ? (editingHotspot.artwork ?? null) : null,
      created_at: new Date().toISOString(),
    };

    const updatedScenes = (activeTour.scenes || []).map((sc) => {
      if (sc.id !== currentScene.id) return sc;
      const existing = sc.hotspots || [];
      const idx = existing.findIndex((h) => h.id === fullHotspot.id);
      let nextHotspots: PanoramaHotspot[];
      if (idx >= 0) {
        nextHotspots = [...existing];
        nextHotspots[idx] = fullHotspot;
      } else {
        nextHotspots = [...existing, fullHotspot];
      }
      return { ...sc, hotspots: nextHotspots };
    });

    setActiveTour({ ...activeTour, scenes: updatedScenes });
    setHotspotModalOpen(false);
    setEditingHotspot(null);
    toast.success("Marker & artwork details saved to room.");
  };

  const updateQuizQuestions = (questions: QuizQuestion[]) => {
    if (!editingHotspot) return;
    setEditingHotspot({
      ...editingHotspot,
      metadata: {
        ...editingHotspot.metadata,
        badge: "❓",
        quizQuestions: questions,
        quizQuestionCount: questions.length,
      },
    });
  };

  const resizeQuizQuestions = (count: number) => {
    if (!editingHotspot) return;
    const nextCount = Math.max(1, Math.min(20, Math.round(count)));
    const questions = [...(editingHotspot.metadata?.quizQuestions ?? [])];
    while (questions.length < nextCount) {
      questions.push({ q: "", options: ["", "", "", ""], answer: 0, explanation: "" });
    }
    updateQuizQuestions(questions.slice(0, nextCount));
  };

  const autoGenerateQuizQuestions = () => {
    if (!editingHotspot || !activeTour) return;
    const destination = destinations.find((item) => item.slug === activeTour.destination_slug);
    if (!destination) {
      toast.error("Choose a destination before generating its quiz.");
      return;
    }
    const count = Math.max(
      1,
      Math.min(
        20,
        editingHotspot.metadata?.quizQuestionCount ??
          editingHotspot.metadata?.quizQuestions?.length ??
          4,
      ),
    );
    const generated = getQuestionsForDestination(destination);
    const questions = Array.from({ length: count }, (_, index) => {
      const question = generated[index];
      return question
        ? { ...question, options: [...question.options] as QuizQuestion["options"] }
        : {
            q: "",
            options: ["", "", "", ""] as QuizQuestion["options"],
            answer: 0,
            explanation: "",
          };
    });
    updateQuizQuestions(questions);
    toast.success(
      `Loaded ${Math.min(count, generated.length)} questions from ${destination.name}; add the remaining ${Math.max(0, count - generated.length)} manually.`,
    );
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (!activeTour || !currentScene) return;
    const updatedScenes = (activeTour.scenes || []).map((sc) => {
      if (sc.id !== currentScene.id) return sc;
      return {
        ...sc,
        hotspots: (sc.hotspots || []).filter((h) => h.id !== hotspotId),
      };
    });
    setActiveTour({ ...activeTour, scenes: updatedScenes });
    setHotspotModalOpen(false);
    setEditingHotspot(null);
    toast.success("Marker removed.");
  };

  // Add a new room/scene to the active tour
  const handleAddNewScene = async () => {
    if (!activeTour || !newSceneTitle) {
      toast.error("Please enter a room or area title.");
      return;
    }
    const sceneId = crypto.randomUUID();
    let originalPath = newScenePanoUrl;
    let previewPath = newScenePreviewUrl;
    let width: number | undefined;
    let height: number | undefined;
    let gridTileUrls: PanoramaScene["tile_configuration"]["gridTileUrls"];

    if (newSceneFile) {
      try {
        const uploaded = await uploadPanoramaAssets(
          activeTour.id,
          sceneId,
          newSceneFile,
          (stage) => {
            const labels = {
              validating: "Checking panorama dimensions…",
              preview: "Uploading mobile preview…",
              tiles: "Creating and uploading mobile-friendly panorama tiles…",
              original: "Uploading full-resolution panorama…",
              complete: "Upload complete",
            };
            setUploadStage(labels[stage]);
          },
        );
        originalPath = uploaded.originalPath;
        previewPath = uploaded.previewPath;
        width = uploaded.width;
        height = uploaded.height;
        gridTileUrls = uploaded.gridTilePaths;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Panorama upload failed.");
        setUploadStage(null);
        return;
      }
    }

    const tileConfiguration: PanoramaScene["tile_configuration"] = {
      tilePadFrac: 0,
      tilePadFracY: 0,
      isUltraHd16k: Boolean(width && width >= 15000),
      isUltraHd12k: Boolean(width && width >= 11000),
    };
    if (width !== undefined) tileConfiguration.nativeWidth = width;
    if (height !== undefined) tileConfiguration.nativeHeight = height;
    if (gridTileUrls) {
      tileConfiguration.gridTileUrls = gridTileUrls;
      tileConfiguration.tilePixelSize = [Math.ceil(width! / 4), Math.ceil(height! / 2)];
    }

    const newScene: PanoramaScene = {
      id: sceneId,
      tour_id: activeTour.id,
      title: newSceneTitle,
      location_label: newSceneLabel || newSceneTitle,
      original_image_path: originalPath,
      preview_image_path: previewPath,
      tile_configuration: tileConfiguration,
      initial_view: { hlookat: 0, vlookat: 0, fov: 80 },
      display_order: (activeTour.scenes?.length || 0) + 1,
      status: "active",
      created_at: new Date().toISOString(),
      hotspots: [],
    };

    setActiveTour({
      ...activeTour,
      scenes: [...(activeTour.scenes || []), newScene],
    });
    setActiveSceneId(sceneId);
    setNewSceneModalOpen(false);
    setNewSceneTitle("");
    setNewSceneLabel("");
    setNewSceneFile(null);
    setUploadStage(null);
    toast.success(`Room "${newScene.title}" added to tour!`);
  };

  // Save tour to database / local store
  const handleSaveTour = async (status: "draft" | "published") => {
    if (!activeTour) return;
    try {
      const tourToSave: PanoramaTour = {
        ...activeTour,
        status,
        cover_image_path:
          activeTour.cover_image_path ?? activeTour.scenes?.[0]?.preview_image_path ?? null,
      };
      const saved = await saveTour(tourToSave);
      setActiveTour(saved);
      toast.success(
        status === "published"
          ? "Virtual tour published and available on its destination page."
          : "Draft saved securely.",
      );
    } catch {
      // error handled in hook toast
    }
  };

  // Handle panorama image upload from user device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparingPanorama(true);
    setNewSceneFile(null);
    setUploadValidation(null);
    setUploadValidationIsValid(null);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const check = validatePanoramaDimensions(img.naturalWidth, img.naturalHeight);
      setUploadValidation(check.message);
      setUploadValidationIsValid(check.valid);
      if (!check.valid) {
        setNewSceneFile(file);
        setNewScenePanoUrl(objectUrl);
        setNewScenePreviewUrl(objectUrl);
        toast.warning(check.message);
        setIsPreparingPanorama(false);
        return;
      }

      try {
        const previewUrl = await generatePanoramaPreview(file);
        setNewSceneFile(file);
        setNewScenePanoUrl(objectUrl);
        setNewScenePreviewUrl(previewUrl);
        toast.success(check.message);
      } catch {
        setNewSceneFile(file);
        setNewScenePanoUrl(objectUrl);
        setNewScenePreviewUrl(objectUrl);
      } finally {
        setIsPreparingPanorama(false);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsPreparingPanorama(false);
      toast.error("The selected panorama could not be read. Choose a JPG or WebP image.");
    };
    img.src = objectUrl;
  };

  const handleArtworkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const artwork = editingHotspot?.artwork;
    if (!file || !artwork || !activeTour || !currentScene) return;
    setArtworkUploadStage("Uploading artwork image…");
    try {
      const imagePath = await uploadArtworkImage(activeTour.id, currentScene.id, artwork.id, file);
      setEditingHotspot((current) =>
        current?.artwork
          ? { ...current, artwork: { ...current.artwork, image_path: imagePath } }
          : current,
      );
      toast.success("Artwork image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Artwork image upload failed.");
    } finally {
      setArtworkUploadStage(null);
      e.target.value = "";
    }
  };

  // Render List of Tours
  if (!activeTour) {
    return (
      <div className="space-y-6">
        <Pop className="p-6 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#0038A8] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                  Dynamic 360° Panorama Builder
                </span>
                <span className="text-[12px] font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> eGovPH Heritage CMS
                </span>
              </div>
              <h2
                className="mt-2 text-[24px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ fontFamily: F.display }}
              >
                Virtual Tours &amp; Artwork Hotspots
              </h2>
              <p className="mt-1 text-[13.5px] text-[#64748B] dark:text-[#94A3B8]">
                Create multi-room 360° virtual tours for CALABARZON destinations, upload
                equirectangular panoramas, connect rooms with doors/stairs, and visually place
                artwork markers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewTour}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0038A8] px-5 py-3 text-[14px] font-extrabold text-white shadow-md hover:bg-[#002366] transition-transform hover:-translate-y-0.5"
            >
              <Plus className="size-4.5" />
              <span>Create New Virtual Tour</span>
            </button>
          </div>
        </Pop>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#1E293B]"
              />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <Pop className="p-8 text-center border border-dashed border-[#CBD5E1] dark:border-[#334155]">
            <Compass className="mx-auto size-12 text-[#0038A8] opacity-60" />
            <h3 className="mt-3 text-[17px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
              No Custom Virtual Tours Created Yet
            </h3>
            <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Click the button above to build your first interactive 360° tour with custom rooms and
              artwork hotspots.
            </p>
            <div className="mt-4">
              <Btn label="+ Create First Tour" color={C.cover} onClick={handleCreateNewTour} />
            </div>
          </Pop>
        ) : (
          <div className="space-y-3">
            {tours.map((t) => {
              const dest = destinations.find((d) => d.slug === t.destination_slug);
              const sceneCount = t.scenes?.length || 1;
              const artworkCount = (t.scenes || []).reduce(
                (sum, s) => sum + (s.hotspots?.filter((h) => h.hotspot_type === "art").length || 0),
                0,
              );

              return (
                <Pop
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B] text-[#0038A8] dark:text-[#93C5FD]">
                      <Compass className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-2 py-0.5 text-[11px] font-bold text-[#0038A8] dark:text-[#93C5FD]">
                          {dest?.name || t.destination_slug}
                        </span>
                        <span className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                          {sceneCount} Room{sceneCount > 1 ? "s" : ""} · {artworkCount} Artwork
                          Hotspot
                          {artworkCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <h4
                        className="mt-1 text-[16.5px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                        style={{ fontFamily: F.display }}
                      >
                        {t.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTour(t);
                        setActiveSceneId(t.scenes?.[0]?.id || "");
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 py-2 text-[12.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:bg-[#F8FAFC]"
                    >
                      <Edit className="size-3.5" /> Edit Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTour(t.id)}
                      className="cursor-pointer rounded-xl p-2 text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#EF4444]/20"
                      title="Delete tour"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Pop>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Active Tour Editor
  return (
    <div className="space-y-6">
      {/* Top Header & Tour Actions */}
      <Pop className="p-5 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTour(null)}
              className="cursor-pointer rounded-xl border border-[#CBD5E1] dark:border-[#334155] p-2 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
              title="Return to Tours list"
            >
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#0038A8] px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
                  Tour Builder Mode
                </span>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Editing Tour ID: <span className="font-mono">{activeTour.id.slice(0, 8)}</span>
                </span>
              </div>
              <h2
                className="mt-1 text-[20px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ fontFamily: F.display }}
              >
                {activeTour.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveTour("published")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-xs hover:bg-[#15803D]"
            >
              <CheckCircle2 className="size-4" /> Publish Tour
            </button>
            <button
              type="button"
              onClick={() => handleSaveTour("draft")}
              className="cursor-pointer rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-[13px] font-bold"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => setActiveTour(null)}
              className="cursor-pointer rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3.5 py-2.5 text-[13px] font-bold text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
            >
              Close
            </button>
          </div>
        </div>
      </Pop>

      {/* Guided Steps / Sub-Editor Tabs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Tour Metadata & Room Scenes List (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <Pop className="p-4 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
            <h3 className="text-[15px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
              Tour Settings &amp; Destination
            </h3>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#64748B]">
                  Tour Title
                </label>
                <input
                  type="text"
                  value={activeTour.title}
                  onChange={(e) => setActiveTour({ ...activeTour, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px] font-medium"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#64748B]">
                  Destination Site
                </label>
                <select
                  value={activeTour.destination_slug}
                  onChange={(e) =>
                    setActiveTour({ ...activeTour, destination_slug: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px] font-medium"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.slug}>
                      {d.province} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#64748B]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={activeTour.description}
                  onChange={(e) => setActiveTour({ ...activeTour, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px] font-medium"
                />
              </div>
            </div>
          </Pop>

          {/* Rooms / Scenes Manager */}
          <Pop className="p-4 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Tour Rooms &amp; Areas ({activeTour.scenes?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setNewSceneModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-2.5 py-1 text-[11.5px] font-extrabold text-[#0038A8] dark:text-[#93C5FD]"
              >
                <Plus className="size-3.5" /> Add Room
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {(activeTour.scenes || []).map((sc, idx) => {
                const isActive = sc.id === currentScene?.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setActiveSceneId(sc.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition border ${
                      isActive
                        ? "border-[#0038A8] bg-[#EFF6FF] dark:bg-[#1E3A8A]/20"
                        : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Room {idx + 1}
                      </p>
                      <p className="truncate text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {sc.title}
                      </p>
                      <p className="text-[10.5px] text-[#64748B]">
                        {sc.hotspots?.length || 0} marker(s) placed
                      </p>
                    </div>

                    {activeTour.scenes && activeTour.scenes.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const filtered = activeTour.scenes!.filter((s) => s.id !== sc.id);
                          setActiveTour({ ...activeTour, scenes: filtered });
                          if (activeSceneId === sc.id) {
                            setActiveSceneId(filtered[0]?.id || "");
                          }
                          toast.success(`Removed room "${sc.title}".`);
                        }}
                        className="cursor-pointer p-1 text-[#EF4444] hover:bg-[#FEE2E2] rounded-md"
                        title="Delete room"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Pop>

          {/* Markers in Current Room */}
          {currentScene && (
            <Pop className="p-4 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  Markers in &ldquo;{currentScene.title}&rdquo;
                </h3>
                <span className="rounded-full bg-[#F1F5F9] dark:bg-[#334155] px-2 py-0.5 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">
                  {currentScene.hotspots?.length || 0} total
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {(currentScene.hotspots || []).length === 0 ? (
                  <p className="text-[12px] italic text-[#64748B]">
                    No markers in this room yet. Use &ldquo;📍 Click to Place Marker&rdquo; above
                    the 360 viewer.
                  </p>
                ) : (
                  (currentScene.hotspots || []).map((hs) => (
                    <div
                      key={hs.id}
                      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px]">
                          {hs.hotspot_type === "info"
                            ? `❓ Quiz · ${hs.metadata.quizQuestions?.length ?? 0} questions`
                            : hs.hotspot_type === "door"
                              ? "🚪 Room Door"
                              : hs.hotspot_type === "stairs-up"
                                ? "🪜 Stairs"
                                : "🖼️ Artwork"}
                        </span>
                        <p className="truncate text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                          {hs.title}
                        </p>
                        <p className="font-mono text-[10px] text-[#64748B]">
                          Yaw: {hs.bearing}° · Pitch: {hs.pitch}°
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHotspot(hs);
                            setHotspotModalOpen(true);
                          }}
                          className="cursor-pointer rounded-lg p-1 text-[#0038A8] dark:text-[#93C5FD] hover:bg-[#EFF6FF]"
                          title="Edit marker"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHotspot(hs.id)}
                          className="cursor-pointer rounded-lg p-1 text-[#EF4444] hover:bg-[#FEE2E2]"
                          title="Delete marker"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Pop>
          )}
        </div>

        {/* Right Column: Interactive 360° Panorama Viewer & Placement Stage (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          <Pop className="p-4 border border-[#CBD5E1] dark:border-[#22314E] dark:bg-[#131C31]">
            {/* Viewer Control Bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#0038A8] text-white">
                  <Compass className="size-4" />
                </span>
                <div>
                  <h4 className="text-[14px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    Active Room: {currentScene?.title}
                  </h4>
                  <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                    Rotate &amp; look around with mouse or touch.
                  </p>
                </div>
              </div>

              {/* Pin Placement Mode Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !pinMode;
                  setPinMode(next);
                  if (next) {
                    toast.info(
                      "Placement Mode Active: Click the exact point on the panorama for an artwork, room, or quiz marker.",
                    );
                  }
                }}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-extrabold shadow-sm transition-transform ${
                  pinMode
                    ? "bg-[#DC2626] text-white ring-2 ring-[#DC2626]/50 animate-pulse"
                    : "bg-[#0038A8] text-white hover:bg-[#002366]"
                }`}
              >
                <MapPin className="size-4" />
                <span>{pinMode ? "Click Anywhere to Place..." : "📍 Add Marker or Quiz"}</span>
              </button>
            </div>

            {pinMode && (
              <div className="mb-3 rounded-xl bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B] p-2.5 text-center">
                <p className="text-[12.5px] font-bold text-[#DC2626] dark:text-[#FCA5A5]">
                  🎯 Tap the exact spot in the 360° room where the artwork or doorway is located!
                </p>
              </div>
            )}

            {/* Embedded Live 360 Viewer */}
            {currentScene ? (
              <div className="relative">
                <KrpanoViewer
                  key={currentScene.id}
                  panoramaUrl={
                    panoramaAssetUrl(currentScene.original_image_path) ??
                    currentScene.original_image_path
                  }
                  {...(PRESET_PANORAMAS[0]?.url
                    ? { fallbackPanoramaUrl: PRESET_PANORAMAS[0].url }
                    : {})}
                  scenes={krpanoScenes}
                  activeSceneId={currentScene.id}
                  onSceneChange={(id) => setActiveSceneId(id)}
                  heightClass="h-[480px] sm:h-[540px]"
                  onCanvasClick={handleCanvasClick}
                  interactivePinMode={pinMode}
                />
              </div>
            ) : null}
          </Pop>
        </div>
      </div>

      {/* MODAL 1: Add New Room/Scene */}
      <Dialog open={newSceneModalOpen} onOpenChange={setNewSceneModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#131C31] border-[#CBD5E1] dark:border-[#22314E]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Add New 360° Room or Area
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Room Name (e.g. &ldquo;2F Master Bedroom&rdquo;, &ldquo;Courtyard Garden&rdquo;)
              </label>
              <input
                type="text"
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                placeholder="e.g. Ancestral Sala"
                className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Area Badge / Floor Label
              </label>
              <input
                type="text"
                value={newSceneLabel}
                onChange={(e) => setNewSceneLabel(e.target.value)}
                placeholder="e.g. 2F Upper Mezzanine"
                className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
              />
            </div>

            {/* Choose or Upload Panorama */}
            <div>
              <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Select 360° Equirectangular Panorama
              </label>
              <select
                value={newScenePanoUrl}
                onChange={(e) => {
                  const found = PRESET_PANORAMAS.find((p) => p.url === e.target.value);
                  setNewScenePanoUrl(e.target.value);
                  setNewSceneFile(null);
                  setIsPreparingPanorama(false);
                  setUploadValidation(null);
                  setUploadValidationIsValid(null);
                  if (found) setNewScenePreviewUrl(found.previewUrl);
                }}
                className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
              >
                {PRESET_PANORAMAS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Custom 360 file */}
            <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] p-3 text-center">
              <Upload className="mx-auto size-5 text-[#0038A8] opacity-70" />
              <p className="mt-1 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Or Upload 360° Equirectangular File (.jpg, .webp)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="mt-2 text-[11px] text-[#64748B]"
              />
              {uploadValidation && (
                <p
                  className={`mt-1 text-[11px] font-bold ${uploadValidationIsValid ? "text-[#16A34A]" : "text-[#DC2626]"}`}
                >
                  {uploadValidation}
                </p>
              )}
              {uploadStage ? (
                <p className="mt-2 text-[11px] font-bold text-[#0038A8]">{uploadStage}</p>
              ) : isPreparingPanorama ? (
                <p className="mt-2 text-[11px] font-bold text-[#0038A8]">
                  Preparing your uploaded panorama…
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setNewSceneModalOpen(false)}
              className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-[#64748B]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleAddNewScene()}
              disabled={Boolean(uploadStage) || isPreparingPanorama}
              className="cursor-pointer rounded-xl bg-[#0038A8] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#002366]"
            >
              {isPreparingPanorama ? "Preparing…" : "Add Room"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Artwork & Marker Hotspot Form */}
      <Dialog open={hotspotModalOpen} onOpenChange={setHotspotModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl bg-white dark:bg-[#131C31] border-[#CBD5E1] dark:border-[#22314E]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {editingHotspot?.hotspot_type === "info"
                ? "Edit Panorama Quiz"
                : editingHotspot?.hotspot_type === "door"
                  ? "Edit Room Transition Door"
                  : "Edit Artwork Marker & Description"}
            </DialogTitle>
          </DialogHeader>

          {editingHotspot && (
            <div className="space-y-4 py-2">
              {/* Marker Type Selector */}
              <div>
                <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  Marker Type
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setEditingHotspot({ ...editingHotspot, hotspot_type: "art" })}
                    className={`cursor-pointer rounded-xl p-2.5 text-center border text-[12px] font-bold transition ${
                      editingHotspot.hotspot_type === "art"
                        ? "border-[#0038A8] bg-[#EFF6FF] text-[#0038A8] dark:bg-[#1E3A8A]/30 dark:text-[#93C5FD]"
                        : "border-[#CBD5E1] dark:border-[#334155] text-[#64748B]"
                    }`}
                  >
                    🖼️ Artwork / Relic
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingHotspot({ ...editingHotspot, hotspot_type: "door" })}
                    className={`cursor-pointer rounded-xl p-2.5 text-center border text-[12px] font-bold transition ${
                      editingHotspot.hotspot_type === "door"
                        ? "border-[#0038A8] bg-[#EFF6FF] text-[#0038A8] dark:bg-[#1E3A8A]/30 dark:text-[#93C5FD]"
                        : "border-[#CBD5E1] dark:border-[#334155] text-[#64748B]"
                    }`}
                  >
                    🚪 Room Door
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingHotspot({ ...editingHotspot, hotspot_type: "stairs-up" })
                    }
                    className={`cursor-pointer rounded-xl p-2.5 text-center border text-[12px] font-bold transition ${
                      editingHotspot.hotspot_type === "stairs-up"
                        ? "border-[#0038A8] bg-[#EFF6FF] text-[#0038A8] dark:bg-[#1E3A8A]/30 dark:text-[#93C5FD]"
                        : "border-[#CBD5E1] dark:border-[#334155] text-[#64748B]"
                    }`}
                  >
                    🪜 Stairs
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const destination = destinations.find(
                        (item) => item.slug === activeTour?.destination_slug,
                      );
                      const existingQuestions = editingHotspot.metadata?.quizQuestions;
                      const seedQuestions = destination
                        ? getQuestionsForDestination(destination)
                        : [];
                      setEditingHotspot({
                        ...editingHotspot,
                        hotspot_type: "info",
                        title:
                          editingHotspot.hotspot_type === "art"
                            ? "Heritage Quick Quiz"
                            : editingHotspot.title || "Heritage Quick Quiz",
                        subtitle:
                          editingHotspot.hotspot_type === "art"
                            ? "Tap to answer questions"
                            : editingHotspot.subtitle || "Tap to answer questions",
                        metadata: {
                          ...editingHotspot.metadata,
                          badge: "❓",
                          quizQuestions: existingQuestions ?? seedQuestions,
                          quizQuestionCount:
                            editingHotspot.metadata?.quizQuestionCount ??
                            existingQuestions?.length ??
                            seedQuestions.length,
                        },
                      });
                    }}
                    className={`cursor-pointer rounded-xl border p-2.5 text-center text-[12px] font-bold transition ${
                      editingHotspot.hotspot_type === "info"
                        ? "border-[#0038A8] bg-[#EFF6FF] text-[#0038A8] dark:bg-[#1E3A8A]/30 dark:text-[#93C5FD]"
                        : "border-[#CBD5E1] dark:border-[#334155] text-[#64748B]"
                    }`}
                  >
                    ❓ Quiz
                  </button>
                </div>
              </div>

              {/* Spherical Coordinates Display */}
              <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] p-2.5 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[11.5px] font-mono text-[#64748B]">
                <span>Spherical Azimuth (Yaw): {editingHotspot.bearing}°</span>
                <span>Vertical Elevation (Pitch): {editingHotspot.pitch}°</span>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    Marker Title
                  </label>
                  <input
                    type="text"
                    value={editingHotspot.title || ""}
                    onChange={(e) =>
                      setEditingHotspot({ ...editingHotspot, title: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    Action / Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingHotspot.subtitle || ""}
                    onChange={(e) =>
                      setEditingHotspot({ ...editingHotspot, subtitle: e.target.value })
                    }
                    placeholder="e.g. Inspect Masterwork"
                    className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
                  />
                </div>
              </div>

              {/* If it's a Door / Stairs: Destination Room dropdown */}
              {(editingHotspot.hotspot_type === "door" ||
                editingHotspot.hotspot_type === "stairs-up" ||
                editingHotspot.hotspot_type === "stairs-down") && (
                <div>
                  <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    Destination Room to Walk Into:
                  </label>
                  <select
                    value={editingHotspot.target_scene_id || ""}
                    onChange={(e) =>
                      setEditingHotspot({ ...editingHotspot, target_scene_id: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[13px]"
                  >
                    <option value="">-- Choose destination room --</option>
                    {(activeTour.scenes || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.location_label})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingHotspot.hotspot_type === "info" && (
                <div className="space-y-3 border-t border-[#E2E8F0] pt-3 dark:border-[#334155]">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#0038A8] dark:text-[#93C5FD]">
                        Questions at this panorama point
                      </h4>
                      <p className="mt-1 max-w-md text-[11.5px] text-[#64748B]">
                        Generate from this destination’s saved heritage quiz, then edit any question
                        or add your own.
                      </p>
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="text-[11.5px] font-bold text-[#64748B]">
                        Question count
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={
                            editingHotspot.metadata?.quizQuestionCount ??
                            editingHotspot.metadata?.quizQuestions?.length ??
                            4
                          }
                          onChange={(event) => resizeQuizQuestions(Number(event.target.value) || 1)}
                          className="mt-1 block w-20 rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-[13px] text-[#1E293B] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={autoGenerateQuizQuestions}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0038A8] px-3 py-2 text-[11.5px] font-bold text-white hover:bg-[#002366]"
                      >
                        <Sparkles className="size-3.5" /> Generate
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(editingHotspot.metadata?.quizQuestions ?? []).map(
                      (question, questionIndex) => (
                        <section
                          key={`${editingHotspot.id}-quiz-${questionIndex}`}
                          className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 dark:border-[#334155] dark:bg-[#1E293B]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-extrabold text-[#1E293B] dark:text-white">
                              Question {questionIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuizQuestions(
                                  (editingHotspot.metadata?.quizQuestions ?? []).filter(
                                    (_, index) => index !== questionIndex,
                                  ),
                                )
                              }
                              disabled={(editingHotspot.metadata?.quizQuestions?.length ?? 0) <= 1}
                              className="cursor-pointer rounded-md p-1 text-[#EF4444] hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Remove question ${questionIndex + 1}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <textarea
                            value={question.q}
                            onChange={(event) => {
                              const next = [...(editingHotspot.metadata?.quizQuestions ?? [])];
                              next[questionIndex] = { ...question, q: event.target.value };
                              updateQuizQuestions(next);
                            }}
                            placeholder="Write the question"
                            rows={2}
                            className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-2 text-[12.5px] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`quiz-answer-${editingHotspot.id}-${questionIndex}`}
                                  checked={question.answer === optionIndex}
                                  onChange={() => {
                                    const next = [
                                      ...(editingHotspot.metadata?.quizQuestions ?? []),
                                    ];
                                    next[questionIndex] = { ...question, answer: optionIndex };
                                    updateQuizQuestions(next);
                                  }}
                                  aria-label={`Mark choice ${optionIndex + 1} as correct`}
                                />
                                <input
                                  value={option}
                                  onChange={(event) => {
                                    const next = [
                                      ...(editingHotspot.metadata?.quizQuestions ?? []),
                                    ];
                                    const options = [
                                      ...question.options,
                                    ] as QuizQuestion["options"];
                                    options[optionIndex] = event.target.value;
                                    next[questionIndex] = { ...question, options };
                                    updateQuizQuestions(next);
                                  }}
                                  placeholder={`Choice ${optionIndex + 1}`}
                                  className="min-w-0 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-[12px] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                                />
                              </label>
                            ))}
                          </div>
                          <textarea
                            value={question.explanation}
                            onChange={(event) => {
                              const next = [...(editingHotspot.metadata?.quizQuestions ?? [])];
                              next[questionIndex] = {
                                ...question,
                                explanation: event.target.value,
                              };
                              updateQuizQuestions(next);
                            }}
                            placeholder="Explain the answer"
                            rows={2}
                            className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-2 text-[12px] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                          />
                          <p className="text-[10.5px] text-[#64748B]">
                            Select the radio button beside the correct choice.
                          </p>
                        </section>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      resizeQuizQuestions((editingHotspot.metadata?.quizQuestions?.length ?? 0) + 1)
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#CBD5E1] px-3 py-2 text-[11.5px] font-bold text-[#0038A8] hover:bg-[#EFF6FF] dark:border-[#334155] dark:text-[#93C5FD]"
                  >
                    <Plus className="size-3.5" /> Add question manually
                  </button>
                </div>
              )}

              {/* If it's an Artwork: Full Manual Curatorial Description Form */}
              {editingHotspot.hotspot_type === "art" && (
                <div className="space-y-3 border-t border-[#E2E8F0] dark:border-[#334155] pt-3">
                  <h4 className="text-[13.5px] font-extrabold text-[#0038A8] dark:text-[#93C5FD]">
                    Curatorial Artwork Information
                  </h4>

                  <div className="rounded-xl border border-dashed border-[#CBD5E1] p-3">
                    <label className="text-[11.5px] font-bold text-[#64748B]">
                      Artwork Image (optional)
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {editingHotspot.artwork?.image_path ? (
                        <img
                          src={panoramaAssetUrl(editingHotspot.artwork.image_path) ?? ""}
                          alt="Artwork preview"
                          className="size-14 rounded-lg object-cover"
                        />
                      ) : null}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => void handleArtworkImageUpload(event)}
                        disabled={Boolean(artworkUploadStage)}
                        className="text-[11px] text-[#64748B]"
                      />
                      {artworkUploadStage ? (
                        <span className="text-[11px] font-bold text-[#0038A8]">
                          {artworkUploadStage}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#64748B]">
                        Filipino Title
                      </label>
                      <input
                        type="text"
                        value={editingHotspot.artwork?.filipino_title || ""}
                        onChange={(e) =>
                          setEditingHotspot({
                            ...editingHotspot,
                            artwork: { ...editingHotspot.artwork!, filipino_title: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#64748B]">
                        Artist / Artisan
                      </label>
                      <input
                        type="text"
                        value={editingHotspot.artwork?.artist || ""}
                        onChange={(e) =>
                          setEditingHotspot({
                            ...editingHotspot,
                            artwork: { ...editingHotspot.artwork!, artist: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#64748B]">
                        Historical Period
                      </label>
                      <input
                        type="text"
                        value={editingHotspot.artwork?.historical_period || ""}
                        onChange={(e) =>
                          setEditingHotspot({
                            ...editingHotspot,
                            artwork: {
                              ...editingHotspot.artwork!,
                              historical_period: e.target.value,
                            },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#64748B]">
                        Medium &amp; Material
                      </label>
                      <input
                        type="text"
                        value={editingHotspot.artwork?.medium || ""}
                        onChange={(e) =>
                          setEditingHotspot({
                            ...editingHotspot,
                            artwork: { ...editingHotspot.artwork!, medium: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[#64748B]">
                      Detailed Artwork Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingHotspot.artwork?.description || ""}
                      onChange={(e) =>
                        setEditingHotspot({
                          ...editingHotspot,
                          artwork: { ...editingHotspot.artwork!, description: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[#64748B]">
                      Historical Significance
                    </label>
                    <input
                      type="text"
                      value={editingHotspot.artwork?.historical_significance || ""}
                      onChange={(e) =>
                        setEditingHotspot({
                          ...editingHotspot,
                          artwork: {
                            ...editingHotspot.artwork!,
                            historical_significance: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-2 text-[12.5px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            {editingHotspot?.id ? (
              <button
                type="button"
                onClick={() => handleDeleteHotspot(editingHotspot.id!)}
                className="cursor-pointer text-[12.5px] font-bold text-[#EF4444]"
              >
                Delete Marker
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHotspotModalOpen(false)}
                className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHotspot}
                className="cursor-pointer rounded-xl bg-[#0038A8] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#002366]"
              >
                Save Marker
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
