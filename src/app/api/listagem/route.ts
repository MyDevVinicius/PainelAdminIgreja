import { NextResponse } from "next/server";
import pool from "../../../lib/mysql";

interface Cliente {
  id: number;
  nome_responsavel: string;
  nome_igreja: string;
  email: string;
  cnpj_cpf: string;
  endereco: string;
  nome_banco: string;
  chave_acesso: string;
  status: string;
  criado_em: string;
  senha?: string | null;
  codigo_verificacao?: string | null;
}

export async function GET() {
  try {
    // Consulta principal para obter a lista de clientes
    const [clientes]: [Cliente[], any] = await pool.execute(`
      SELECT 
        id, 
        nome_responsavel, 
        nome_igreja, 
        email, 
        cnpj_cpf, 
        endereco, 
        nome_banco, 
        chave_acesso, 
        status, 
        criado_em 
      FROM clientes
    `);

    // Para cada cliente, buscar a senha no banco correspondente
    const clientesCompletos: Cliente[] = await Promise.all(
      clientes.map(async (cliente) => {
        if (!cliente.nome_banco) return cliente; // Caso não haja banco associado, retorna o cliente como está.

        try {
          // Buscar a senha no banco do cliente
          const [usuario]: [{ senha: string }[], any] = await pool.query(
            `
            SELECT senha 
            FROM ${pool.escapeId(cliente.nome_banco)}.usuarios 
            WHERE email = ?
          `,
            [cliente.email]
          );

          if (usuario && usuario.length > 0) {
            cliente.senha = usuario[0].senha; // Adiciona a senha ao objeto cliente
          } else {
            cliente.senha = null;
          }

          // Buscar o código de verificação no banco admin_db (não criptografado)
          const [codigoVerificacao]: [{ codigo_verificacao: string }[], any] =
            await pool.query(
              `
            SELECT codigo_verificacao 
            FROM admin_db.clientes 
            WHERE email = ?
          `,
              [cliente.email]
            );

          if (codigoVerificacao && codigoVerificacao.length > 0) {
            cliente.codigo_verificacao =
              codigoVerificacao[0].codigo_verificacao; // Código já está no formato correto
          } else {
            cliente.codigo_verificacao = null;
          }
        } catch (error) {
          console.error(
            `Erro ao buscar dados do cliente ${cliente.nome_banco}:`,
            error
          );
          cliente.senha = null;
          cliente.codigo_verificacao = null;
        }

        return cliente;
      })
    );

    return NextResponse.json(clientesCompletos);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { message: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}
