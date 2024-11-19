import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { nome_responsavel, nome_igreja, email, cnpj_cpf, endereco } =
    await req.json();

  if (!nome_responsavel || !nome_igreja || !email || !cnpj_cpf || !endereco) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios!" },
      { status: 400 }
    );
  }

  try {
    const conn = await pool.getConnection();

    // Gerar um código de verificação único de 15 dígitos
    const codigoAcesso = crypto.randomBytes(8).toString("hex").slice(0, 15); // Gera um código de 15 caracteres

    // Gerar o nome do banco com base no nome da igreja
    const nome_banco = nome_igreja.replace(/\s+/g, "_").toLowerCase(); // Remover espaços e colocar em minúsculas

    // Inserir o cliente na tabela principal com o código de verificação, nome do banco e outros dados
    const query =
      "INSERT INTO clientes (nome_responsavel, nome_igreja, email, cnpj_cpf, endereco, nome_banco, chave_acesso, status, codigo_verificacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      nome_banco,
      codigoAcesso,
      "ativo",
      codigoAcesso,
    ];
    await conn.query(query, values);

    // Criar banco de dados para o cliente com o nome gerado
    const createDbQuery = `CREATE DATABASE IF NOT EXISTS ${nome_banco}`;
    await conn.query(createDbQuery);

    // Criar tabela de usuários no banco específico do cliente
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cargo ENUM('cooperador', 'pastor', 'tesoureiro', 'diacono', 'conselho_fiscal') NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await conn.query(createTableQuery);

    // Criar outras tabelas necessárias (entrada, saída, membros, etc.)
    const createEntryTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.entrada (
        id INT AUTO_INCREMENT PRIMARY KEY,
        valor DECIMAL(10, 2) NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await conn.query(createEntryTableQuery);

    const createExitTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.saida (
        id INT AUTO_INCREMENT PRIMARY KEY,
        valor DECIMAL(10, 2) NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await conn.query(createExitTableQuery);

    const createMembersTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.membros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        data_nascimento DATE,
        endereco VARCHAR(255)
      );
    `;
    await conn.query(createMembersTableQuery);

    // Inserir o usuário com cargo 'conselho_fiscal' e senha sendo o código de acesso
    const insertUserQuery = `
      INSERT INTO ${nome_banco}.usuarios (nome, email, senha, cargo) 
      VALUES (?, ?, ?, ?)
    `;
    const userValues = [
      nome_responsavel,
      email,
      codigoAcesso,
      "conselho_fiscal",
    ];
    await conn.query(insertUserQuery, userValues);

    // Retornar sucesso e código de acesso
    return NextResponse.json(
      {
        message: "Cliente cadastrado e banco de dados criado com sucesso!",
        chaveAcesso: codigoAcesso, // Retorna a chave de acesso
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao cadastrar cliente!" },
      { status: 500 }
    );
  }
}
