import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

// Função para deletar usuário
export async function DELETE(req: NextRequest) {
  // Captura o ID da URL
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Pega o ID do usuário da URL

  if (!id) {
    return NextResponse.json(
      { message: "ID do usuário é obrigatório!" },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Deletar o usuário com o ID especificado
    const [result]: any = await conn.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    conn.release();

    // Se o usuário não for encontrado, retorna erro
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
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { message: "Erro ao excluir usuário!" },
      { status: 500 }
    );
  }
}
