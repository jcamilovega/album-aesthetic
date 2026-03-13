"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LayoutType = "full" | "two-h" | "two-v" | "three" | "four";

interface Page {
  id: string;
  layout: LayoutType;
  photos: (string | null)[];
}

function PreviewPageCanvas({ page }: { page: Page }) {
  const { layout, photos } = page;

  const Slot = ({ url }: { url: string | null }) =>
    url ? (
      <img src={url} alt="" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-neutral-100" />
    );

  if (layout === "full") {
    return (
      <div className="w-full h-full">
        <Slot url={photos[0] ?? null} />
      </div>
    );
  }
  if (layout === "two-h") {
    return (
      <div className="w-full h-full flex flex-col gap-0.5">
        <div className="flex-1 overflow-hidden"><Slot url={photos[0] ?? null} /></div>
        <div className="flex-1 overflow-hidden"><Slot url={photos[1] ?? null} /></div>
      </div>
    );
  }
  if (layout === "two-v") {
    return (
      <div className="w-full h-full flex flex-row gap-0.5">
        <div className="flex-1 overflow-hidden"><Slot url={photos[0] ?? null} /></div>
        <div className="flex-1 overflow-hidden"><Slot url={photos[1] ?? null} /></div>
      </div>
    );
  }
  if (layout === "three") {
    return (
      <div className="w-full h-full flex flex-col gap-0.5">
        <div className="flex-1 overflow-hidden"><Slot url={photos[0] ?? null} /></div>
        <div className="flex gap-0.5" style={{ height: "45%" }}>
          <div className="flex-1 overflow-hidden"><Slot url={photos[1] ?? null} /></div>
          <div className="flex-1 overflow-hidden"><Slot url={photos[2] ?? null} /></div>
        </div>
      </div>
    );
  }
  if (layout === "four") {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden"><Slot url={photos[i] ?? null} /></div>
        ))}
      </div>
    );
  }
  return null;
}

export default function PreviewPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedPages = sessionStorage.getItem("albumPages");
    const storedBookId = sessionStorage.getItem("bookId");

    if (storedPages) {
      try {
        const parsed = JSON.parse(storedPages);
        if (Array.isArray(parsed)) setPages(parsed);
      } catch (e) {
        console.error("Error leyendo páginas:", e);
      }
    }

    if (storedBookId) setBookId(storedBookId);
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
    window.location.href = `https://checkout.wompi.co/l/test_XcFMuF?redirect-url=${redirectUrl}`;
  };

  if (pages.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400 text-sm">No hay páginas para mostrar.</p>
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Editar páginas
        </button>
        <span className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
          AdventureBook
        </span>
        <span className="text-sm text-neutral-400">
          {pages.length} {pages.length === 1 ? "página" : "páginas"}
        </span>
      </div>

      {/* Preview de páginas */}
      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-neutral-900 mb-1">Preview de tu álbum</h1>
          <p className="text-neutral-400 text-sm">Así se verá tu libro impreso</p>
        </div>

        {/* Portada */}
        <div className="bg-neutral-900 rounded-2xl p-6 shadow-xl overflow-hidden">
          <p className="text-neutral-500 text-xs tracking-widest uppercase mb-3 text-center">
            AdventureBook
          </p>
          <div className="aspect-[3/4] rounded-xl overflow-hidden">
            <PreviewPageCanvas page={pages[0]} />
          </div>
          <p className="text-neutral-500 text-xs mt-3 text-center">Portada · Página 1</p>
        </div>

        {/* Páginas interiores */}
        {pages.slice(1).map((page, index) => (
          <div
            key={page.id}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <PreviewPageCanvas page={page} />
            </div>
            <div className="px-5 py-3">
              <span className="text-xs text-neutral-300">Página {index + 2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Barra sticky de pago */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">Tu álbum está listo</p>
            <p className="text-xs text-neutral-400">
              {pages.length} páginas · entrega en 7–10 días
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