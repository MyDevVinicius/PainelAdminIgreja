import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // Caminho para o pool de conexões

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente não fornecido." },
        { status: 400 }
      );
    }

    // Inicia uma transação para garantir que ambas as operações sejam atômicas
    await connection.beginTransaction();

    const [clienteResult]: [any, any] = await connection.execute(
      `
        SELECT nome_banco FROM clientes WHERE id = ?
      `,
      [id]
    );

    if (clienteResult.length === 0) {
      await connection.rollback(); // Desfaz a transação se o cliente não for encontrado
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const nomeBanco = clienteResult[0].nome_banco;

    // Tenta excluir o banco de dados do cliente
    const dropDatabaseQuery = `DROP DATABASE IF EXISTS \`${nomeBanco}\``;
    await connection.query(dropDatabaseQuery);

    // Exclui o cliente da tabela 'clientes'
    const [result]: [any, any] = await connection.execute(
      `
        DELETE FROM clientes WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback(); // Desfaz a transação se o cliente não for deletado
      return NextResponse.json(
        { message: "Cliente não encontrado ou já foi deletado." },
        { status: 404 }
      );
    }

    // Se ambos os comandos passarem, confirma a transação
    await connection.commit();

    return NextResponse.json(
      { message: "Cliente e seu banco de dados deletados com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback(); // Desfaz qualquer alteração caso ocorra erro
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao deletar cliente." },
      { status: 500 }
    );
  } finally {
    connection.release(); // Libera a conexão de volta ao pool
  }
}
