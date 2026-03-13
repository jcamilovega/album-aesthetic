"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const [images, setImages] = useState<string[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedImages = sessionStorage.getItem("albumImages");
    const storedBookId = sessionStorage.getItem("bookId");

    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        if (Array.isArray(parsed)) setImages(parsed);
      } catch (e) {
        console.error("Error leyendo imágenes:", e);
      }
    }

    if (storedBookId) {
      setBookId(storedBookId);
    }
  }, []);

  const handlePayment = () => {
  if (!bookId) {
    alert("No se encontró el ID del álbum.");
    return;
  }

  setLoading(true);

  const redirectUrl = encodeURIComponent(
    `https://adventurebook.co/success?bookId=${bookId}`
  );

  window.location.href = `https://checkout.wompi.co/l/test_XJTfaC?redirect-url=${redirectUrl}`;
};

  if (images.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400 text-sm">No hay imágenes para mostrar.</p>
        <button
          onClick={() => router.push("/create")}
          className="text-sm underline text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          Volver a crear álbum
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push("/create")}
          className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Editar fotos
        </button>
        <span className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
          AdventureBook
        </span>
        <span className="text-sm text-neutral-400">
          {images.length} {images.length === 1 ? "página" : "páginas"}
        </span>
      </div>

      {/* Álbum preview */}
      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-neutral-900 mb-1">
            Preview de tu álbum
          </h1>
          <p className="text-neutral-400 text-sm">
            Así se verá tu libro impreso — una foto por página
          </p>
        </div>

        {/* Portada simulada */}
        <div className="bg-neutral-900 rounded-2xl p-8 text-center shadow-xl">
          <p className="text-neutral-500 text-xs tracking-widest uppercase mb-3">
            AdventureBook
          </p>
          <div className="aspect-[3/4] rounded-xl overflow-hidden">
            <img
              src={images[0]}
              alt="Portada"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-neutral-500 text-xs mt-4">Portada</p>
        </div>

        {/* Páginas interiores */}
        {images.slice(1).map((url, index) => (
          <div
            key={url}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={url}
                alt={`Página ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-neutral-300">
                Página {index + 2}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de pago sticky */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Tu álbum está listo
            </p>
            <p className="text-xs text-neutral-400">
              {images.length} fotos · entrega en 7–10 días
            </p>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? "Redirigiendo…" : "Pagar e imprimir →"}
          </button>
        </div>
      </div>
    </main>
  );
}
