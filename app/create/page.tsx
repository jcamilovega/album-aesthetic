"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CreatePage() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (files.length + imageUrls.length > 40) {
      alert("Máximo 40 fotos");
      return;
    }

    setUploading(true);
    setUploadCount(0);

    const newUrls: string[] = [];

    for (const file of files) {
      // Nombre único para evitar colisiones
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

      const { error } = await supabase.storage
        .from("album-photos") // 👈 nombre de tu bucket en Supabase Storage
        .upload(fileName, file);

      if (error) {
        console.error("Error subiendo foto:", error);
        alert(`Error subiendo ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("album-photos")
        .getPublicUrl(fileName);

      newUrls.push(urlData.publicUrl);
      setUploadCount((prev) => prev + 1);
    }

    setImageUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
    // Limpiar input para permitir re-selección de los mismos archivos
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const goToPreview = async () => {
    if (imageUrls.length === 0) {
      alert("Sube al menos una foto primero");
      return;
    }

    // Guardar el libro en Supabase DB con las URLs reales
    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          title: "Mi AdventureBook",
          images: imageUrls, // ✅ URLs de strings, no File objects
          paid: false,
        },
      ])
      .select();

    if (error) {
      console.error("Error guardando libro:", error);
      alert("Error guardando el álbum. Revisa RLS en Supabase.");
      return;
    }

    const bookId = data[0].id;

    // Guardar bookId y URLs en sessionStorage para el preview
    sessionStorage.setItem("bookId", bookId);
    sessionStorage.setItem("albumImages", JSON.stringify(imageUrls));

    router.push("/preview");
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-100 px-8 py-5 flex items-center justify-between">
        <span className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
          AdventureBook
        </span>
        <span className="text-sm text-neutral-400">
          {imageUrls.length} / 40 fotos
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-light text-neutral-900 mb-2">
            Crea tu álbum
          </h1>
          <p className="text-neutral-400 text-sm">
            Cada foto ocupará una página. Sube hasta 40 imágenes.
          </p>
        </div>

        {/* Upload zone */}
        {imageUrls.length < 40 && (
          <label className="group block border border-dashed border-neutral-200 rounded-2xl p-12 text-center cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 mb-8">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div>
                <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-neutral-500">
                  Subiendo foto {uploadCount + 1}…
                </p>
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-neutral-200 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                    <path d="M12 16V4M12 4L8 8M12 4L16 8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-700 mb-1">
                  Seleccionar fotos
                </p>
                <p className="text-xs text-neutral-400">
                  JPG, PNG, HEIC — hasta 40 imágenes
                </p>
              </div>
            )}
          </label>
        )}

        {/* Grid de fotos */}
        {imageUrls.length > 0 && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-10">
              {imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100"
                >
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Número de página */}
                  <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] rounded-md px-1.5 py-0.5 font-medium">
                    {index + 1}
                  </div>
                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreview}
                disabled={uploading}
                className="bg-neutral-900 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40"
              >
                Ver preview del álbum →
              </button>
              <span className="text-xs text-neutral-400">
                {imageUrls.length} {imageUrls.length === 1 ? "página" : "páginas"}
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
