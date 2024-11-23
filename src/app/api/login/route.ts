import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import bcrypt from "bcryptjs";

// Definir a tipagem da resposta para a consulta do banco
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: "admin" | "gerente";
  criado_em: string;
}

export async function POST(req: NextRequest) {
  const { email, senha }: { email: string; senha: string } = await req.json();

  if (!email || !senha) {
    return NextResponse.json(
      { message: "Email e senha são obrigatórios!" },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Tipar corretamente o resultado da consulta
    const [rows] = await conn.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado!" },
        { status: 404 }
      );
    }

    const usuario = rows[0];

    // Comparar a senha fornecida com a senha criptografada no banco
    const isValidPassword = await bcrypt.compare(senha, usuario.senha);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Senha incorreta!" },
        { status: 401 }
      );
    }

    // Retornar uma resposta de login bem-sucedido
    return NextResponse.json(
      { message: "Login bem-sucedido!", usuario },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao fazer login!" },
      { status: 500 }
    );
  }
}
