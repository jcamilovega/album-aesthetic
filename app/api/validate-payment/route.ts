import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "No transaction id" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://sandbox.wompi.co/v1/transactions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        },
      }
    );

    const data = await response.json();

    console.log("Respuesta completa Wompi:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error validating payment" }, { status: 500 });
  }
}