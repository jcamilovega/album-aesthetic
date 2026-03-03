"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PreviewPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("albumImages");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setImages(parsed);
        }
      } catch (error) {
        console.error("Error cargando imágenes:", error);
      }
    }
  }, []);

  // Agrupar 2 imágenes por página
  const pages = [];
  for (let i = 0; i < images.length; i += 2) {
    pages.push(images.slice(i, i + 2));
  }

  const handlePayment = async () => {
    if (images.length === 0) {
      alert("No hay imágenes para guardar.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          title: "Mi AdventureBook",
          images: images, // jsonb acepta array
          paid: false,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      alert("Error guardando el libro. Revisa RLS.");
      setLoading(false);
      return;
    }

    const bookId = data[0].id;

    // 🔥 PEGA AQUÍ TU LINK DE WOMPI

    const redirectUrl = encodeURIComponent(
      `http://localhost:3000/success?bookId=${bookId}`
    );

    const wompiLink = `https://checkout.wompi.co/l/test_z6TLg0?redirect-url=${redirectUrl}`;

    window.location.href = "https://checkout.wompi.co/l/test_z6TLg0";
  };

  return (
    <main className="bg-neutral-200 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        {pages.length > 0 ? (
          pages.map((page, index) => (
            <div
              key={index}
              className="bg-white aspect-[3/4] shadow-xl rounded-xl p-8 flex flex-col justify-center items-center gap-6"
            >
              {page.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="preview"
                  className="max-h-60 object-contain"
                />
              ))}

              <p className="text-sm text-gray-400 mt-auto">
                Página {index + 1}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No hay imágenes para mostrar.
          </p>
        )}
      </div>

      {/* BOTÓN DE PAGO */}
      <div className="text-center mt-12">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-green-600 text-white px-8 py-4 rounded-xl hover:opacity-80 transition text-lg font-semibold shadow-lg disabled:opacity-50"
        >
          {loading ? "Redirigiendo..." : "Imprimir mi AdventureBook"}
        </button>
      </div>
    </main>
  );
}