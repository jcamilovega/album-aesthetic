"use client";

import { useState } from "react";

export default function CreatePage() {
  const [images, setImages] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (images.length + files.length > 40) {
      alert("Máximo 40 fotos permitidas");
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Sube tus fotos para tu AdventureBook
      </h1>

      <div className="max-w-2xl mx-auto">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="mb-6"
        />

        <p className="mb-4 text-gray-600">
          {images.length} / 40 fotos
        </p>

        <div className="grid grid-cols-3 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-1 rounded"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {images.length > 0 && (
          <button className="mt-8 w-full bg-black text-white py-3 rounded-xl">
            Continuar
          </button>
        )}
      </div>
    </main>
  );
}