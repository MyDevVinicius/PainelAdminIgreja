import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // Caminho para o pool

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      nome_banco,
      chave_acesso,
      codigo_verificacao,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente não fornecido." },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [result]: [any, any] = await connection.execute(
        `
          UPDATE clientes
          SET
            nome_responsavel = ?,
            nome_igreja = ?,
            email = ?,
            cnpj_cpf = ?,
            endereco = ?,
            nome_banco = ?,
            chave_acesso = ?,
            codigo_verificacao = ?,
            status = ?
          WHERE id = ?
        `,
        [
          nome_responsavel,
          nome_igreja,
          email,
          cnpj_cpf,
          endereco,
          nome_banco,
          chave_acesso,
          codigo_verificacao,
          status,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "Cliente não encontrado ou nenhum dado foi alterado." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Cliente atualizado com sucesso." },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar cliente." },
      { status: 500 }
    );
  }
}
