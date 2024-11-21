import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { status } = await req.json();

    // Verifica se o ID é válido e se o status é um valor aceitável
    if (!id || !status || !["ativo", "inativo"].includes(status)) {
      return NextResponse.json(
        { message: "Dados inválidos ou incompletos!" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();

    // Atualizar o status do cliente no banco de dados
    const updateQuery = "UPDATE clientes SET status = ? WHERE id = ?";
    const [result] = await conn.query(updateQuery, [status, id]);

    conn.release();

    // Verifica se o cliente foi encontrado e o status atualizado
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Cliente não encontrado!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Status atualizado com sucesso!", status },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor!" },
      { status: 500 }
    );
  }
}
