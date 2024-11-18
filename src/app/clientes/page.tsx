"use client";
import { useState } from 'react';

export default function ClientesPage() {
  const [form, setForm] = useState({
    nome_responsavel: '',
    nome_igreja: '',
    email: '',
    cnpj_cpf: '',
    endereco: '',
    codigo_verificacao: '', // Campo para o código de verificação
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Para gerenciar o estado de carregamento
  const [responseStatus, setResponseStatus] = useState<boolean | null>(null); // Estado para verificar sucesso ou falha

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Inicia o estado de carregamento

    // Adicionar o código de verificação à requisição
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMessage(data.message);

    // Define o status da resposta (true para sucesso, false para erro)
    setResponseStatus(res.ok);

    // Se a requisição for bem-sucedida, limpar o formulário
    if (res.ok) {
      setForm({
        nome_responsavel: '',
        nome_igreja: '',
        email: '',
        cnpj_cpf: '',
        endereco: '',
        codigo_verificacao: '', // Limpar campo de código
      });
    }
    setLoading(false); // Finaliza o carregamento
  };

  const handleGenerateCode = async () => {
    // Gerar código aleatório diretamente no frontend
    const generatedCode = Math.random().toString(36).substr(2, 15).toUpperCase();
    setForm({ ...form, codigo_verificacao: generatedCode });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Adicionar Cliente</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(form).map((field) => (
          field !== 'codigo_verificacao' && (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium mb-1 capitalize">{field.replace('_', ' ')}</label>
              <input
                type="text"
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )
        ))}

        {/* Código de verificação */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Código de Verificação</label>
          <input
            type="text"
            name="codigo_verificacao"
            value={form.codigo_verificacao}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />
          <button
            type="button"
            onClick={handleGenerateCode}
            className="mt-2 w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          >
            Gerar Código
          </button>
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white py-2 rounded hover:bg-blue-600`}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Adicionar'}
        </button>
      </form>

      {/* Mensagem de retorno */}
      {message && (
        <p className={`mt-4 text-center ${responseStatus === null ? '' : responseStatus ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
      )}
    </div>
  );
}
