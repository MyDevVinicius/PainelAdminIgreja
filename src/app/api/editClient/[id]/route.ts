import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql"; // Configuração do pool de conexão
import crypto from "crypto";
import bcrypt from "bcryptjs"; // Para hashear a senha

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório!" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      chave_acesso,
      senha, // Nova senha enviada para o cliente
      status, // Status tratado separadamente
    }: {
      nome_responsavel?: string;
      nome_igreja?: string;
      email?: string;
      cnpj_cpf?: string;
      endereco?: string;
      chave_acesso?: string;
      senha?: string; // Novo campo para senha
      status?: "ativo" | "inativo";
    } = body;

    if (
      !nome_responsavel &&
      !nome_igreja &&
      !email &&
      !cnpj_cpf &&
      !endereco &&
      !status &&
      !senha
    ) {
      return NextResponse.json(
        { message: "Pelo menos um campo deve ser enviado para atualização!" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();

    try {
      // Verifica se o cliente existe e obtém o nome do banco de dados
      const getClienteQuery =
        "SELECT nome_banco, status FROM clientes WHERE id = ?";
      const [clientes]: any[] = await conn.query(getClienteQuery, [id]);

      if (!clientes || clientes.length === 0) {
        return NextResponse.json(
          { message: "Cliente não encontrado!" },
          { status: 404 }
        );
      }

      const nome_banco = clientes[0].nome_banco;
      const clienteStatus = clientes[0].status; // Status atual do cliente

      if (!nome_banco) {
        return NextResponse.json(
          { message: "Banco de dados do cliente não está configurado!" },
          { status: 500 }
        );
      }

      // Gera uma nova chave de acesso se não for fornecida
      const novaChaveAcesso =
        chave_acesso || crypto.randomBytes(8).toString("hex").slice(0, 15);

      // Atualiza os dados do cliente na tabela principal
      const updateClienteQuery = `
        UPDATE clientes 
        SET 
          nome_responsavel = COALESCE(?, nome_responsavel),
          nome_igreja = COALESCE(?, nome_igreja),
          email = COALESCE(?, email),
          cnpj_cpf = COALESCE(?, cnpj_cpf),
          endereco = COALESCE(?, endereco),
          chave_acesso = ?
        WHERE id = ?`;
      const updateClienteValues = [
        nome_responsavel,
        nome_igreja,
        email,
        cnpj_cpf,
        endereco,
        novaChaveAcesso,
        id,
      ];

      await conn.query(updateClienteQuery, updateClienteValues);

      // Se o status foi enviado, atualiza também o status
      if (status && status !== clienteStatus) {
        const updateStatusQuery = `
          UPDATE clientes 
          SET status = ? 
          WHERE id = ?`;
        await conn.query(updateStatusQuery, [status, id]);
      }

      // Atualiza os dados do usuário no banco de dados do cliente
      const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null; // Hash da nova senha, se enviada

      const updateUserQuery = `
        UPDATE ${conn.escapeId(nome_banco)}.usuarios 
        SET 
          nome = COALESCE(?, nome),
          email = COALESCE(?, email),
          senha = COALESCE(?, senha) 
        WHERE email = ?`;
      const updateUserValues = [
        nome_responsavel,
        email,
        hashedPassword, // Atualiza a senha com o hash gerado, se fornecida
        email,
      ];

      await conn.query(updateUserQuery, updateUserValues);

      return NextResponse.json(
        {
          message: "Cliente e usuário atualizados com sucesso!",
          chaveAcesso: novaChaveAcesso,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Erro ao executar queries:", error);
      return NextResponse.json(
        { message: "Erro ao atualizar o cliente!", error: error.message },
        { status: 500 }
      );
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { message: "Erro ao processar a requisição!", error: error.message },
      { status: 500 }
    );
  }
}
