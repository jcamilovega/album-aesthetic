import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Validando pago...</p>}>
      <SuccessContent />
    </Suspense>
  );
}