// src/app/api/listUser/route.ts
import { NextResponse } from "next/server";
import pool from "../../../lib/mysql"; // Certifique-se de apontar para seu arquivo de conexão ao banco

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao listar usuários", error: error.message },
      { status: 500 }
    );
  }
}
