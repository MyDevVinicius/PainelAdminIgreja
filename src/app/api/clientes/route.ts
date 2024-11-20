import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import bcrypt from "bcryptjs"; // Importação do bcrypt para criptografar a chave de acesso

// Função para validar o nome do banco (evitar caracteres especiais ou inválidos)
const sanitizeDatabaseName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9_]/g, ""); // Permite apenas letras, números e underscores
};

// Função para gerar código aleatório de 15 caracteres (sem criptografia)
const gerarCodigoVerificacao = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Apenas maiúsculas e números
  let codigo = "";
  for (let i = 0; i < 15; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

export async function POST(req: NextRequest) {
  const { nome_responsavel, nome_igreja, email, cnpj_cpf, endereco } =
    await req.json();

  // Validação para garantir que todos os campos obrigatórios sejam preenchidos
  if (!nome_responsavel || !nome_igreja || !email || !cnpj_cpf || !endereco) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios!" },
      { status: 400 }
    );
  }

  // Sanitizar o nome da igreja para o nome do banco
  const nome_banco = sanitizeDatabaseName(
    nome_igreja.replace(/\s+/g, "_").toLowerCase()
  );

  try {
    const conn = await pool.getConnection();

    // Gerar um código de verificação único de 15 caracteres aleatórios (sem criptografia)
    const codigoAcesso = gerarCodigoVerificacao();
    const codigoVerificacao = gerarCodigoVerificacao(); // Código de verificação simples, sem criptografia

    // Criptografar a chave de acesso
    const chaveAcessoCriptografada = await bcrypt.hash(codigoAcesso, 10); // Usando bcrypt para criptografar a chave de acesso

    // Inserir o cliente na tabela principal com o código de verificação, nome do banco e outros dados
    const query = `
      INSERT INTO clientes (nome_responsavel, nome_igreja, email, cnpj_cpf, endereco, nome_banco, chave_acesso, status, codigo_verificacao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      nome_responsavel,
      nome_igreja,
      email,
      cnpj_cpf,
      endereco,
      nome_banco,
      chaveAcessoCriptografada, // Chave de acesso criptografada
      "pendente", // O cliente começa com status "pendente"
      codigoVerificacao, // Código de verificação simples (não criptografado)
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

    // Criar outras tabelas necessárias
    const createEntryTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.entrada (
        id INT AUTO_INCREMENT PRIMARY KEY,
        observacao VARCHAR(255) ,
        tipo ENUM('Dizimo','Oferta','Doacao','Campanha') NOT NULL,
        forma_pagamento ENUM('Dinheiro','PIX','Debito','Credito'),
        valor DECIMAL(10, 2) NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await conn.query(createEntryTableQuery);

    const createExitTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.saida (
        id INT AUTO_INCREMENT PRIMARY KEY,
        observacao VARCHAR(255) ,
        tipo ENUM('Pagamento','Salario','Ajuda de Custo') NOT NULL,
        forma_pagamento ENUM('Dinheiro','PIX','Debito','Credito'),
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
        endereco VARCHAR(255),
        status ENUM('ativo','inativo')
      );
    `;
    await conn.query(createMembersTableQuery);

    const createContasTableQuery = `
      CREATE TABLE IF NOT EXISTS ${nome_banco}.contas_a_pagar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        observacao VARCHAR(255) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status ENUM('Pago','Pendente','Pago Parcial','Vencida'),
        data_vencimento DATE
      );
    `;
    await conn.query(createContasTableQuery);

    // Inserir o usuário com cargo 'conselho_fiscal' e senha sendo o código de acesso criptografado
    const insertUserQuery = `
      INSERT INTO ${nome_banco}.usuarios (nome, email, senha, cargo) 
      VALUES (?, ?, ?, ?)
    `;
    const userValues = [
      nome_responsavel,
      email,
      chaveAcessoCriptografada, // Usar a chave de acesso criptografada como senha
      "conselho_fiscal",
    ];
    await conn.query(insertUserQuery, userValues);

    // Retornar sucesso com a chave de acesso gerada
    return NextResponse.json(
      {
        message: "Cliente cadastrado e banco de dados criado com sucesso!",
        chaveAcesso: codigoAcesso, // Retorna a chave de acesso gerada (não criptografada)
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
