'use client'

import { useState } from 'react';

export default function CadastroUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'gerente'>('gerente');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enviar os dados para a API de cadastro
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, role })
    });

    const data = await response.json();
    setMensagem(data.message);
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center">Cadastro de Usuário</h1>
      {mensagem && <p className="text-center mt-4 text-green-600">{mensagem}</p>}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <label htmlFor="nome" className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="senha" className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'gerente')}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          >
            <option value="gerente">Gerente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
