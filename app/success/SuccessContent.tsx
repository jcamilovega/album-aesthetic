"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");
  const bookId = searchParams.get("bookId");

  const [status, setStatus] = useState("Validando pago...");

  useEffect(() => {
    const validatePayment = async () => {
      if (!transactionId) {
        setStatus("No se encontró id de transacción.");
        return;
      }

      try {
        const response = await fetch(`/api/validate-payment?id=${transactionId}`);
        const result = await response.json();

        if (result?.data?.status === "APPROVED") {

          const { data: books, error: fetchError } = await supabase
            .from("books")
            .select("*")
            .eq("paid", false)
            .order("created_at", { ascending: false })
            .limit(1);

          if (fetchError || !books || books.length === 0) {
            setStatus("No se encontró libro pendiente.");
            return;
          }

          const bookId = books[0].id;

          const { error: updateError } = await supabase
          .from("books")
          .update({ paid: true })
          .eq("id", bookId);

          if (updateError) {
            setStatus("Error actualizando el pago.");
            return;
          }

          setStatus("¡Pago confirmado! Tu AdventureBook está listo 🎉");
        } else {
          setStatus("El pago no fue aprobado.");
        }
      } catch (err) {
        setStatus("Error validando la transacción.");
      }
    };

    validatePayment();
  }, [transactionId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Resultado del pago</h1>
        <p className="text-gray-700">{status}</p>
      </div>
    </main>
  );
}