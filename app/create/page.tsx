"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type LayoutType = "full" | "two-h" | "two-v" | "three" | "four";

interface Page {
  id: string;
  layout: LayoutType;
  photos: (string | null)[];
}

// ─── Config de layouts ─────────────────────────────────────────────────────────

const LAYOUTS: { type: LayoutType; label: string; slots: number; icon: React.ReactNode }[] = [
  {
    type: "full",
    label: "1 foto",
    slots: 1,
    icon: <div className="w-full h-full bg-neutral-300 rounded-sm" />,
  },
  {
    type: "two-h",
    label: "2 horiz.",
    slots: 2,
    icon: (
      <div className="w-full h-full flex flex-col gap-0.5">
        <div className="flex-1 bg-neutral-300 rounded-sm" />
        <div className="flex-1 bg-neutral-300 rounded-sm" />
      </div>
    ),
  },
  {
    type: "two-v",
    label: "2 vert.",
    slots: 2,
    icon: (
      <div className="w-full h-full flex flex-row gap-0.5">
        <div className="flex-1 bg-neutral-300 rounded-sm" />
        <div className="flex-1 bg-neutral-300 rounded-sm" />
      </div>
    ),
  },
  {
    type: "three",
    label: "3 fotos",
    slots: 3,
    icon: (
      <div className="w-full h-full flex flex-col gap-0.5">
        <div className="flex-1 bg-neutral-300 rounded-sm" />
        <div className="flex gap-0.5" style={{ height: "45%" }}>
          <div className="flex-1 bg-neutral-300 rounded-sm" />
          <div className="flex-1 bg-neutral-300 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    type: "four",
    label: "4 fotos",
    slots: 4,
    icon: (
      <div className="w-full h-full grid grid-cols-2 gap-0.5">
        <div className="bg-neutral-300 rounded-sm" />
        <div className="bg-neutral-300 rounded-sm" />
        <div className="bg-neutral-300 rounded-sm" />
        <div className="bg-neutral-300 rounded-sm" />
      </div>
    ),
  },
];

// ─── Slot individual ──────────────────────────────────────────────────────────

function PhotoSlot({
  url,
  index,
  pageId,
  onDropPhoto,
  onDropSlotToSlot,
  onDragStartSlot,
  draggingFrom,
}: {
  url: string | null;
  index: number;
  pageId: string;
  onDropPhoto: (url: string, slotIndex: number) => void;
  onDropSlotToSlot: (targetSlot: number) => void;
  onDragStartSlot: (slotIndex: number) => void;
  draggingFrom: React.MutableRefObject<"panel" | "slot" | null>;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm"
      style={{
        height: "100%",
        minHeight: 0,
        outline: over ? "2px solid #171717" : "2px solid transparent",
        outlineOffset: "-2px",
        transition: "outline 0.1s",
      }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (draggingFrom.current === "panel") {
          const photoUrl = e.dataTransfer.getData("photoUrl");
          if (photoUrl) onDropPhoto(photoUrl, index);
        } else if (draggingFrom.current === "slot") {
          onDropSlotToSlot(index);
        }
      }}
    >
      {url ? (
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
          draggable
          onDragStart={() => onDragStartSlot(index)}
        />
      ) : (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-200">
          <span className="text-neutral-300 text-xs select-none">arrastra aquí</span>
        </div>
      )}
    </div>
  );
}

// ─── Canvas de página ─────────────────────────────────────────────────────────

function PageCanvas({
  page,
  onDropPhoto,
  onDropSlotToSlot,
  onDragStartSlot,
  draggingFrom,
}: {
  page: Page;
  onDropPhoto: (url: string, slotIndex: number) => void;
  onDropSlotToSlot: (targetSlot: number) => void;
  onDragStartSlot: (slotIndex: number) => void;
  draggingFrom: React.MutableRefObject<"panel" | "slot" | null>;
}) {
  const slotProps = (i: number) => ({
    url: page.photos[i] ?? null,
    index: i,
    pageId: page.id,
    onDropPhoto,
    onDropSlotToSlot,
    onDragStartSlot,
    draggingFrom,
  });

  if (page.layout === "full") {
    return <div className="w-full h-full"><PhotoSlot {...slotProps(0)} /></div>;
  }
  if (page.layout === "two-h") {
    return (
      <div className="w-full h-full flex flex-col gap-1.5">
        <div className="flex-1 min-h-0"><PhotoSlot {...slotProps(0)} /></div>
        <div className="flex-1 min-h-0"><PhotoSlot {...slotProps(1)} /></div>
      </div>
    );
  }
  if (page.layout === "two-v") {
    return (
      <div className="w-full h-full flex flex-row gap-1.5">
        <div className="flex-1 min-w-0"><PhotoSlot {...slotProps(0)} /></div>
        <div className="flex-1 min-w-0"><PhotoSlot {...slotProps(1)} /></div>
      </div>
    );
  }
  if (page.layout === "three") {
    return (
      <div className="w-full h-full flex flex-col gap-1.5">
        <div className="flex-1 min-h-0"><PhotoSlot {...slotProps(0)} /></div>
        <div className="flex-shrink-0 flex gap-1.5" style={{ height: "42%" }}>
          <div className="flex-1 min-w-0"><PhotoSlot {...slotProps(1)} /></div>
          <div className="flex-1 min-w-0"><PhotoSlot {...slotProps(2)} /></div>
        </div>
      </div>
    );
  }
  if (page.layout === "four") {
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5">
        {[0, 1, 2, 3].map((i) => <PhotoSlot key={i} {...slotProps(i)} />)}
      </div>
    );
  }
  return null;
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function CreatePage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const draggingFrom = useRef<"panel" | "slot" | null>(null);
  const draggingSlotIndex = useRef<number | null>(null);
  const router = useRouter();

  // ── Subida ───────────────────────────────────────────────────────────────────

  const uploadFiles = async (files: File[]) => {
    if (files.length + imageUrls.length > 40) { alert("Máximo 40 fotos"); return; }
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    let completed = 0;

    const uploadOne = async (file: File): Promise<string | null> => {
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error } = await supabase.storage.from("album-photos").upload(fileName, file);
      if (error) { console.error(error); return null; }
      const { data: urlData } = supabase.storage.from("album-photos").getPublicUrl(fileName);
      completed++;
      setUploadProgress({ current: completed, total: files.length });
      return urlData.publicUrl;
    };

    const results = await Promise.all(files.map(uploadOne));
    const newUrls = results.filter(Boolean) as string[];

    setImageUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await uploadFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const urlToRemove = imageUrls[index];
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setPages((prev) =>
      prev.map((p) => ({ ...p, photos: p.photos.map((ph) => (ph === urlToRemove ? null : ph)) }))
    );
  };

  // ── Paso 1 → 2 ──────────────────────────────────────────────────────────────

  const goToStep2 = () => {
    // Agrupar fotos de a 2 → mitad de páginas con layout two-h
    const initial: Page[] = [];
    for (let i = 0; i < imageUrls.length; i += 2) {
      initial.push({
        id: `p-${i}-${Date.now()}`,
        layout: imageUrls[i + 1] ? "two-h" : "full",
        photos: imageUrls[i + 1] ? [imageUrls[i], imageUrls[i + 1]] : [imageUrls[i]],
      });
    }
    setPages(initial);
    setCurrentPageIndex(0);
    setStep(2);
  };

  // ── Helpers página ───────────────────────────────────────────────────────────

  const currentPage = pages[currentPageIndex];

  const changeLayout = (newLayout: LayoutType) => {
    setPages((prev) => prev.map((p, i) => {
      if (i !== currentPageIndex) return p;
      const slots = LAYOUTS.find((l) => l.type === newLayout)!.slots;
      return { ...p, layout: newLayout, photos: Array.from({ length: slots }, (_, j) => p.photos[j] ?? null) };
    }));
  };

  const addPage = () => {
    setPages((prev) => [...prev, { id: `p-new-${Date.now()}`, layout: "full", photos: [null] }]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = () => {
    if (pages.length === 1) return;
    setPages((prev) => prev.filter((_, i) => i !== currentPageIndex));
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  // ── Drag ─────────────────────────────────────────────────────────────────────

  const handlePanelDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData("photoUrl", url);
    draggingFrom.current = "panel";
  };

  const handleSlotDragStart = (slotIndex: number) => {
    draggingFrom.current = "slot";
    draggingSlotIndex.current = slotIndex;
  };

  const handleDropPhoto = (url: string, slotIndex: number) => {
    setPages((prev) => prev.map((p, i) => {
      if (i !== currentPageIndex) return p;
      const photos = [...p.photos];
      photos[slotIndex] = url;
      return { ...p, photos };
    }));
    draggingFrom.current = null;
  };

  const handleDropSlotToSlot = (targetSlot: number) => {
    const srcSlot = draggingSlotIndex.current;
    if (srcSlot === null) return;
    setPages((prev) => prev.map((p, i) => {
      if (i !== currentPageIndex) return p;
      const photos = [...p.photos];
      [photos[srcSlot], photos[targetSlot]] = [photos[targetSlot], photos[srcSlot]];
      return { ...p, photos };
    }));
    draggingFrom.current = null;
    draggingSlotIndex.current = null;
  };

  // ── Guardar ──────────────────────────────────────────────────────────────────

  const goToPreview = async () => {
    setSaving(true);
    const allUrls = pages.flatMap((p) => p.photos.filter(Boolean) as string[]);
    const { data, error } = await supabase
      .from("books")
      .insert([{ title: "Mi AdventureBook", images: allUrls, pages, paid: false }])
      .select();
    if (error) {
      console.error(error);
      alert("Error guardando el álbum. Revisa RLS en Supabase.");
      setSaving(false);
      return;
    }
    sessionStorage.setItem("bookId", data[0].id);
    sessionStorage.setItem("albumPages", JSON.stringify(pages));
    router.push("/preview");
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="border-b border-neutral-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium tracking-widest text-neutral-400 uppercase">AdventureBook</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full transition-colors ${step === 1 ? "bg-neutral-900 text-white" : "text-neutral-400"}`}>1 · Fotos</span>
          <span className={`text-xs px-3 py-1 rounded-full transition-colors ${step === 2 ? "bg-neutral-900 text-white" : "text-neutral-400"}`}>2 · Páginas</span>
        </div>
        <span className="text-sm text-neutral-400">{imageUrls.length} / 40</span>
      </div>

      {/* ── PASO 1 ── */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto px-8 py-12 w-full">
          <div className="mb-10">
            <h1 className="text-3xl font-light text-neutral-900 mb-2">Sube tus fotos</h1>
            <p className="text-neutral-400 text-sm">Hasta 40 imágenes. Después podrás organizarlas por páginas.</p>
          </div>

          {imageUrls.length < 40 && (
            <label className="group block border border-dashed border-neutral-200 rounded-2xl p-12 text-center cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 mb-8">
              <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
              {uploading ? (
                <div>
                  <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Subiendo {uploadProgress.current} de {uploadProgress.total}…</p>
                </div>
              ) : (
                <div>
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-neutral-200 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                      <path d="M12 16V4M12 4L8 8M12 4L16 8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">Seleccionar fotos</p>
                  <p className="text-xs text-neutral-400">JPG, PNG, HEIC — hasta 40 imágenes</p>
                </div>
              )}
            </label>
          )}

          {imageUrls.length > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-10">
                {imageUrls.map((url, index) => (
                  <div key={url} className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] rounded-md px-1.5 py-0.5 font-medium">{index + 1}</div>
                    <button onClick={() => removeImage(index)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={goToStep2} disabled={uploading} className="bg-neutral-900 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40">
                Organizar páginas →
              </button>
            </>
          )}
        </div>
      )}

      {/* ── PASO 2 ── */}
      {step === 2 && currentPage && (
        <div className="flex flex-1 relative" style={{ height: "calc(100vh - 57px)" }}>

          {/* Panel izquierdo: fotos */}
          <div className="w-1/5 min-w-[160px] max-w-[220px] border-r border-neutral-100 flex flex-col bg-neutral-50 overflow-hidden flex-shrink-0">
            <div className="px-3 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Fotos</span>
              <span className="text-xs text-neutral-400">{imageUrls.length}/40</span>
            </div>

            <label className="mx-3 mb-3 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-neutral-200 cursor-pointer hover:border-neutral-400 hover:bg-white transition-all flex-shrink-0">
              <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
              {uploading ? (
                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                  <span className="text-xs text-neutral-400">Agregar fotos</span>
                </>
              )}
            </label>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <div className="grid grid-cols-2 gap-1.5">
                {imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square rounded-md overflow-hidden bg-neutral-200 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handlePanelDragStart(e, url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover select-none" draggable={false} />
                    <div className="absolute bottom-0.5 left-0.5 bg-black/50 text-white text-[9px] rounded px-1 font-medium leading-4">{index + 1}</div>
                    <button onClick={() => removeImage(index)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-neutral-100 flex-shrink-0">
              <button onClick={() => setStep(1)} className="w-full text-xs text-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Volver a fotos
              </button>
            </div>
          </div>

          {/* Panel derecho: editor */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400 mr-1.5">Layout</span>
                {LAYOUTS.map((l) => (
                  <button
                    key={l.type}
                    onClick={() => changeLayout(l.type)}
                    title={l.label}
                    className={`w-9 h-9 p-1.5 rounded-lg border-2 transition-all ${
                      currentPage.layout === l.type
                        ? "border-neutral-900 bg-white shadow-sm"
                        : "border-transparent hover:border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    {l.icon}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={addPage} className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-50 border border-neutral-200 transition-colors">
                  + Página
                </button>
                {pages.length > 1 && (
                  <button onClick={removePage} className="text-xs text-neutral-300 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-neutral-100 transition-colors">
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center bg-neutral-100 p-8 overflow-hidden">
              <div
                className="bg-white shadow-2xl overflow-hidden"
                style={{
                  aspectRatio: "3/4",
                  height: "min(calc(100vh - 210px), 580px)",
                  maxWidth: "435px",
                  width: "100%",
                  borderRadius: "2px",
                }}
              >
                <div className="w-full h-full p-2.5">
                  <PageCanvas
                    page={currentPage}
                    onDropPhoto={handleDropPhoto}
                    onDropSlotToSlot={handleDropSlotToSlot}
                    onDragStartSlot={handleSlotDragStart}
                    draggingFrom={draggingFrom}
                  />
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white flex-shrink-0">

              {/* Anterior con tip */}
              <div className="relative group">
                <button
                  onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
                  disabled={currentPageIndex === 0}
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-25"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Anterior
                </button>
                {currentPageIndex === 0 && pages.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-3 w-52 pointer-events-none">
                    <div className="bg-neutral-900 text-white text-xs rounded-xl px-3.5 py-2.5 leading-relaxed shadow-lg">
                      <p className="font-medium mb-1">Tips de edición</p>
                      <p className="text-neutral-400">· Arrastra fotos del panel izquierdo a los slots</p>
                      <p className="text-neutral-400">· Cambia el layout con los iconos de arriba</p>
                      <p className="text-neutral-400">· Agrega o elimina páginas con los botones</p>
                      <div className="absolute bottom-0 left-4 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPageIndex(i)}
                    className={`rounded-full transition-all ${i === currentPageIndex ? "w-5 h-2 bg-neutral-900" : "w-2 h-2 bg-neutral-300 hover:bg-neutral-500"}`}
                  />
                ))}
                <span className="ml-2 text-xs text-neutral-400">{currentPageIndex + 1} / {pages.length}</span>
              </div>

              {/* Siguiente con tip */}
              <div className="relative group">
                <button
                  onClick={() => setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-25"
                >
                  Siguiente
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                {currentPageIndex === pages.length - 1 && pages.length > 0 && (
                  <div className="absolute bottom-full right-0 mb-3 w-52 pointer-events-none">
                    <div className="bg-neutral-900 text-white text-xs rounded-xl px-3.5 py-2.5 leading-relaxed shadow-lg">
                      <p className="font-medium mb-1">¿Necesitas más páginas?</p>
                      <p className="text-neutral-400">· Pulsa <span className="text-white">+ Página</span> en la barra de arriba</p>
                      <p className="text-neutral-400">· O elimina esta con <span className="text-white">Eliminar</span></p>
                      <p className="text-neutral-400">· Puedes mover fotos entre páginas arrastrando</p>
                      <div className="absolute bottom-0 right-4 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón continuar flotante */}
          <div className="absolute bottom-20 right-6 z-10">
            <button
              onClick={goToPreview}
              disabled={saving}
              className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-xl hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
              ) : "Ver preview final →"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
