"use client";
import { useState } from "react";

// Função para gerar código aleatório de 15 caracteres
const gerarCodigoAleatorio = () => {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let codigo = "";
  for (let i = 0; i < 15; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const CadastroCliente = () => {
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeIgreja, setNomeIgreja] = useState("");
  const [email, setEmail] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [nomeBanco, setNomeBanco] = useState("");
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");
  const [codigoVerificacao, setCodigoVerificacao] = useState("");

  // Função para gerar e definir o código aleatório para chave de acesso
  const gerarChaveAcesso = () => {
    setChaveAcesso(gerarCodigoAleatorio());
  };

  // Função para gerar e definir o código aleatório para o código de verificação
  const gerarCodigoVerificacao = () => {
    setCodigoVerificacao(gerarCodigoAleatorio());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cliente = {
      nome_responsavel: nomeResponsavel,
      nome_igreja: nomeIgreja,
      email,
      cnpj_cpf: cnpjCpf,
      endereco,
      nome_banco: nomeBanco,
      chave_acesso: chaveAcesso,
      status,
      codigo_verificacao: codigoVerificacao,
    };

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    if (res.ok) {
      alert("Cliente cadastrado com sucesso!");
    } else {
      alert("Erro ao cadastrar cliente!");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Cadastro de Cliente</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Coluna 1 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nome do Responsável
          </label>
          <input
            type="text"
            value={nomeResponsavel}
            onChange={(e) => setNomeResponsavel(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nome da Igreja
          </label>
          <input
            type="text"
            value={nomeIgreja}
            onChange={(e) => setNomeIgreja(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Coluna 2 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">CNPJ/CPF</label>
          <input
            type="text"
            value={cnpjCpf}
            onChange={(e) => setCnpjCpf(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Endereço</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nome do Banco
          </label>
          <input
            type="text"
            value={nomeBanco}
            onChange={(e) => setNomeBanco(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Coluna 3 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Chave de Acesso
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={chaveAcesso}
              onChange={(e) => setChaveAcesso(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={gerarChaveAcesso}
              className="ml-2 bg-blue-600 text-white p-2 rounded"
            >
              Gerar
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
            className="w-full p-2 border rounded"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Código de Verificação
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={codigoVerificacao}
              onChange={(e) => setCodigoVerificacao(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={gerarCodigoVerificacao}
              className="ml-2 bg-blue-600 text-white p-2 rounded"
            >
              Gerar
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded mt-4 col-span-3"
        >
          Cadastrar Cliente
        </button>
      </form>
    </div>
  );
};

export default CadastroCliente;