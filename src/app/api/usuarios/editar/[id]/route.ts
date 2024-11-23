import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql"; // A conexão com o banco de dados (ajuste conforme sua implementação)

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Pega o ID do parâmetro da URL
    const { id } = params;

    // Pega os dados do corpo da requisição
    const data = await req.json();

    // Desestruturação dos dados enviados para atualização
    const { nome, email, senha } = data;

    // Verifica se os campos necessários foram enviados
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios!" },
        { status: 400 }
      );
    }

    // Atualização no banco de dados
    const query = `
      UPDATE usuarios
      SET nome = ?, email = ?, senha = ?
      WHERE id = ?
    `;
    const values = [nome, email, senha, id];

    // Executa a query no banco de dados usando o pool de conexões
    const [result] = await pool.execute(query, values);

    // Verifica se a atualização foi bem-sucedida
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado!" },
        { status: 404 }
      );
    }

    // Retorna sucesso caso o usuário tenha sido atualizado
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
