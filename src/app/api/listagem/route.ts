// Arquivo: app/api/clientes/route.ts

import { NextResponse } from "next/server";
import pool from "../../../lib/mysql"; // Certifique-se de que você tenha a configuração correta do pool do MySQL.

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nome_responsavel, 
        nome_igreja, 
        email, 
        cnpj_cpf, 
        endereco, 
        nome_banco, 
        chave_acesso, 
        status, 
        criado_em 
      FROM clientes`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}
