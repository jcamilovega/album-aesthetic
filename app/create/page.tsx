"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CreatePage() {
  const [images, setImages] = useState<File[]>([]);
  const router = useRouter();

  const saveBook = async () => {
  const imageNames = images.map((file) => file.name);

  const { data, error } = await supabase
    .from("books")
    .insert([
      {
        title: "Mi AdventureBook",
        images: imageNames, // ahora solo strings
      },
    ])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    alert("Error guardando libro");
    return;
  }

  alert("Libro guardado 🎉");
  console.log(data);
};

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (files.length + images.length > 40) {
      alert("Máximo 40 fotos");
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Crea tu AdventureBook</h1>

      <label className="inline-block cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <span className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-80 transition">
          Subir fotos
        </span>
      </label>

      <p className="mt-4 mb-6 text-gray-600">
        {images.length} / 40 fotos seleccionadas
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((file, index) => (
          <div
            key={index}
            className="aspect-square bg-white rounded-xl overflow-hidden shadow"
          >
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* BOTÓN PREVIEW */}
      <button
        onClick={() => {
          localStorage.setItem("albumImages", JSON.stringify(images));
          router.push("/preview");
        }}
        className="mt-6 mr-4 bg-gray-700 text-white px-6 py-3 rounded-xl"
      >
        Crear preview
      </button>

      {/* BOTÓN GUARDAR */}
      <button
        onClick={saveBook}
        className="mt-6 bg-black text-white px-6 py-3 rounded-xl hover:opacity-80 transition"
      >
        Guardar AdventureBook
      </button>
    </main>
  );
}