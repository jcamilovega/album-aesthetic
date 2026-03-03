import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, bookId } = await req.json();

  const response = await fetch("https://sandbox.wompi.co/v1/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount_in_cents: amount,
      currency: "COP",
      customer_email: "test@test.com",
      payment_method: {
        type: "CARD",
        token: "tok_test_visa_4242"
      },
      reference: `book-${bookId}`,
    }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}