import Link from "next/link";

export default function Home() {
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Convierte tus aventuras en un libro inolvidable
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Sube tus fotos y crea tu AdventureBook.
        </p>

        <Link
          href="/create"
          className="bg-black text-white px-6 py-3 rounded-xl inline-block"
        >
          Crear mi álbum
        </Link>
      </div>
    </main>
  );
}