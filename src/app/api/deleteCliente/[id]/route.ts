import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // Caminho para o pool

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente não fornecido." },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [clienteResult]: [any, any] = await connection.execute(
        `
          SELECT nome_banco FROM clientes WHERE id = ?
        `,
        [id]
      );

      if (clienteResult.length === 0) {
        return NextResponse.json(
          { message: "Cliente não encontrado." },
          { status: 404 }
        );
      }

      const nomeBanco = clienteResult[0].nome_banco;

      const dropDatabaseQuery = `DROP DATABASE IF EXISTS \`${nomeBanco}\``;
      await connection.query(dropDatabaseQuery);

      const [result]: [any, any] = await connection.execute(
        `
          DELETE FROM clientes WHERE id = ?
        `,
        [id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "Cliente não encontrado ou já foi deletado." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Cliente e seu banco de dados deletados com sucesso." },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao deletar cliente." },
      { status: 500 }
    );
  }
}
