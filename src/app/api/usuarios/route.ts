import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql'; // Ajuste o caminho do seu pool
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { nome, email, senha, role }: { nome: string; email: string; senha: string; role: string } = await req.json();

  // Verificação dos campos obrigatórios
  if (!nome || !email || !senha || !role) {
    return NextResponse.json({ message: 'Todos os campos são obrigatórios!' }, { status: 400 });
  }

  // Verificar se o papel é válido
  if (!['admin', 'gerente'].includes(role)) {
    return NextResponse.json({ message: 'O campo "role" deve ser "admin" ou "gerente"' }, { status: 400 });
  }

  try {
    const conn = await pool.getConnection();

    // Verificar se o usuário já existe
    const [rows]: any[] = await conn.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length > 0) {
      return NextResponse.json({ message: 'Usuário já cadastrado!' }, { status: 400 });
    }

    // Hash da senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o número de "salt rounds"

    // Inserir o novo usuário no banco de dados
    const [result] = await conn.query(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)', 
      [nome, email, hashedPassword, role]
    );

    return NextResponse.json({ message: 'Usuário cadastrado com sucesso!' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erro ao cadastrar usuário!' }, { status: 500 });
  }
}
