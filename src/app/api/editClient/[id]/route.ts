import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql"; // Caminho para a configuração do pool de conexão
import crypto from "crypto";

// Função para tratar requisições PUT para atualizar dados do cliente
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Aguardar o acesso ao parâmetro id
    const { id } = params; // Não é necessário usar await aqui, pois 'params' já está disponível na rota

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório!" },
        { status: 400 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    const {
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      chave_acesso,
    }: {
      nome_responsavel?: string;
      nome_igreja?: string;
      email?: string;
      cnpj_cpf?: string;
      endereco?: string;
      chave_acesso?: string;
    } = body;

    // Verifica se pelo menos um campo foi enviado para atualização
    if (
      !nome_responsavel &&
      !nome_igreja &&
      !email &&
      !cnpj_cpf &&
      !endereco
    ) {
      return NextResponse.json(
        { message: "Pelo menos um campo deve ser enviado para atualização!" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();

    try {
      // Verifica se o cliente existe e obtém o nome do banco de dados
      const getClienteQuery = "SELECT nome_banco FROM clientes WHERE id = ?";
      const [clientes]: any[] = await conn.query(getClienteQuery, [id]);

      if (!clientes || clientes.length === 0) {
        return NextResponse.json(
          { message: "Cliente não encontrado!" },
          { status: 404 }
        );
      }

      const nome_banco = clientes[0].nome_banco;

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

      // Atualiza os dados do usuário no banco de dados do cliente
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
        novaChaveAcesso, // Atualiza a senha para a nova chave de acesso
        email,
      ];

      await conn.query(updateUserQuery, updateUserValues);

      // Retorna uma mensagem de sucesso e a nova chave de acesso gerada
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
