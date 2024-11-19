// src/app/api/usuario/route.ts
import { NextResponse } from "next/server";
import db from "../../../lib/mysql"; // Supondo que você tenha um arquivo de conexão com o banco

// Definir tipo para os dados retornados
interface Usuario {
  nome: string;
}

export async function GET(request: Request) {
  // Aqui vamos assumir que você tem uma forma de pegar o ID do usuário logado, por exemplo, com uma session ou um token
  const userId = 1; // Substitua por sua lógica de pegar o usuário logado (token JWT, session, etc.)

  // Consulta SQL para pegar o nome do usuário baseado no ID
  try {
    // Usar db.query para pegar diretamente o resultado da consulta
    const [rows] = (await db.query("SELECT nome FROM usuarios WHERE id = ?", [
      userId,
    ])) as [Usuario[], any]; // Garantir que o tipo do retorno seja [Usuario[], any]

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Retorna o nome do usuário
    const nome = rows[0].nome;
    return NextResponse.json({ nome });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar o usuário" },
      { status: 500 }
    );
  }
}
