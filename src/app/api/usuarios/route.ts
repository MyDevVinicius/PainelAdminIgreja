// src/api/usuarios/route.ts
import { NextRequest, NextResponse } from "next/server"; // Importações essenciais
import pool from "@/lib/mysql"; // Importação da conexão com o MySQL
import bcrypt from "bcryptjs"; // Para hashing e comparação de senhas

// Tipagem do usuário
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: "admin" | "gerente";
  criado_em: string;
}

// Função POST para cadastrar novo usuário
export async function POST(req: NextRequest) {
  const {
    nome,
    email,
    senha,
    role,
  }: { nome: string; email: string; senha: string; role: "admin" | "gerente" } =
    await req.json();

  // Verificação de campos obrigatórios
  if (!nome || !email || !senha || !role) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios!" },
      { status: 400 }
    );
  }

  // Verificação se o papel é válido
  if (!["admin", "gerente"].includes(role)) {
    return NextResponse.json(
      { message: 'O campo "role" deve ser "admin" ou "gerente"' },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Verificar se o usuário já existe
    const [rows]: any[] = await conn.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return NextResponse.json(
        { message: "Usuário já cadastrado!" },
        { status: 400 }
      );
    }

    // Hash da senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir o novo usuário no banco de dados
    const [result] = await conn.query(
      "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
      [nome, email, hashedPassword, role]
    );

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao cadastrar usuário!" },
      { status: 500 }
    );
  }
}

// Função PUT para editar um usuário
export async function PUT(req: NextRequest) {
  const {
    id,
    nome,
    email,
    senha,
    role,
  }: {
    id: number;
    nome: string;
    email: string;
    senha?: string;
    role: "admin" | "gerente";
  } = await req.json();

  // Verificação de campos obrigatórios
  if (!id || !nome || !email || !role) {
    return NextResponse.json(
      { message: "Todos os campos obrigatórios devem ser preenchidos!" },
      { status: 400 }
    );
  }

  // Verificar se o papel é válido
  if (!["admin", "gerente"].includes(role)) {
    return NextResponse.json(
      { message: 'O campo "role" deve ser "admin" ou "gerente"' },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Construção da consulta para atualizar os dados do usuário
    let query = "UPDATE usuarios SET nome = ?, email = ?, role = ?";
    const params: any[] = [nome, email, role];

    if (senha) {
      // Atualiza a senha somente se fornecida
      const hashedPassword = await bcrypt.hash(senha, 10);
      query += ", senha = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(id);

    // Executa a consulta
    const [result] = await conn.query(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Usuário atualizado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar usuário!" },
      { status: 500 }
    );
  }
}

// Função DELETE para excluir um usuário
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID do usuário é obrigatório!" },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Excluir o usuário pelo ID
    const [result] = await conn.query("DELETE FROM usuarios WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Usuário excluído com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao excluir usuário!" },
      { status: 500 }
    );
  }
}
