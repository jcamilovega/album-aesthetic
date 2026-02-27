"use client";

import { useEffect, useState } from "react";

export default function PreviewPage() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("albumImages");
    if (stored) {
      const parsed: File[] = JSON.parse(stored);
      const urls = parsed.map((file: any) =>
        URL.createObjectURL(file)
      );
      setImages(urls);
    }
  }, []);

  // Agrupar 2 por página
  const pages = [];
  for (let i = 0; i < images.length; i += 2) {
    pages.push(images.slice(i, i + 2));
  }

  return (
    <main className="bg-neutral-200 min-h-screen py-10">
      <div className="max-w-3xl mx-auto space-y-10">
        {pages.map((page, index) => (
          <div
            key={index}
            className="bg-white aspect-[3/4] shadow-xl rounded-xl p-8 flex flex-col justify-center items-center gap-6"
          >
            {page.map((img, i) => (
              <img
                key={i}
                src={img}
                className="max-h-60 object-contain"
              />
            ))}

            <p className="text-sm text-gray-400 mt-auto">
              Página {index + 1}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}