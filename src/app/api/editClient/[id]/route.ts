import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import crypto from "crypto";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { nome_responsavel, nome_igreja, email, cnpj_cpf, endereco, chave_acesso } = await req.json();

  if (!nome_responsavel || !nome_igreja || !email || !cnpj_cpf || !endereco || !chave_acesso) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios!" },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Primeiro, obtenha o nome do banco relacionado ao cliente
    const getClienteQuery = "SELECT nome_banco FROM clientes WHERE id = ?";
    const [cliente] = await conn.query(getClienteQuery, [params.id]);

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado!" },
        { status: 404 }
      );
    }

    const nome_banco = cliente[0].nome_banco;

    // Gerar um novo código de acesso caso necessário
    const novoCodigoAcesso = chave_acesso || crypto.randomBytes(8).toString("hex").slice(0, 15);

    // Atualizar o cliente na tabela principal
    const updateClienteQuery =
      "UPDATE clientes SET nome_responsavel = ?, nome_igreja = ?, email = ?, cnpj_cpf = ?, endereco = ?, chave_acesso = ? WHERE id = ?";
    const updateValues = [
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      novoCodigoAcesso,
      params.id,
    ];
    await conn.query(updateClienteQuery, updateValues);

    // Atualizar o usuário no banco específico do cliente com a nova chave de acesso
    const updateUserQuery = `
      UPDATE ${nome_banco}.usuarios 
      SET nome = ?, email = ?, senha = ? 
      WHERE email = ?;
    `;
    const userValues = [
      nome_responsavel,
      email,
      novoCodigoAcesso, // Atualiza a senha com o novo código de acesso
      email,
    ];
    await conn.query(updateUserQuery, userValues);

    // Retornar sucesso com a nova chave de acesso
    return NextResponse.json(
      {
        message: "Cliente e usuário atualizados com sucesso!",
        chaveAcesso: novoCodigoAcesso, // Retorna a chave de acesso atualizada
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar cliente!" },
      { status: 500 }
    );
  }
}
