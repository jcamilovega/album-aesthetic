import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Convierte tus fotos en un álbum aesthetic
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Sube tus fotos y recibe un álbum listo para imprimir.
        </p>
        
        <Link href="/create">
        <button className="bg-black text-white px-6 py-3 rounded-xl">
          Crear mi álbum
        </button>
      </Link>
      </div>
    </main>
  );
}
