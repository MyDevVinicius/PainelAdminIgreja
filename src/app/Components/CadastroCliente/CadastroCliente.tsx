"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [status, setStatus] = useState<"ativo" | "inativo" | "pendente">(
    "pendente"
  );
  const [codigoVerificacao, setCodigoVerificacao] = useState("");

  // Função para gerar e definir o código aleatório para chave de acesso
  const gerarChaveAcesso = () => {
    setChaveAcesso(gerarCodigoAleatorio());
  };

  // Função para gerar código de verificação com letras maiúsculas e números
  const gerarCodigoVerificacao = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Apenas maiúsculas e números
    let codigo = "";
    for (let i = 0; i < 15; i++) {
      codigo += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    setCodigoVerificacao(codigo);
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

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      if (res.ok) {
        toast.success("Cliente cadastrado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        // Resetando os campos
        setNomeResponsavel("");
        setNomeIgreja("");
        setEmail("");
        setCnpjCpf("");
        setEndereco("");
        setNomeBanco("");
        setChaveAcesso("");
        setStatus("ativo");
        setCodigoVerificacao("");
      } else {
        const error = await res.json();
        toast.error(`Erro: ${error.message || "Não foi possível cadastrar."}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Erro ao cadastrar cliente. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-media">
        Cadastro de Cliente
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Coluna 1 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-media mb-2">
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
          <label className="block text-sm font-medium text-media mb-2">
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
          <label className="block text-sm font-medium text-media mb-2">
            Email
          </label>
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
          <label className="block text-sm font-medium text-media mb-2">
            CNPJ/CPF
          </label>
          <input
            type="text"
            value={cnpjCpf}
            onChange={(e) => setCnpjCpf(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-media mb-2">
            Endereço
          </label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-media mb-2">
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
          <label className="block text-sm font-medium text-media mb-2">
            Senha Temporária
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
              className="ml-2 bg-media text-white p-2 rounded"
            >
              Gerar
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-media mb-2">
            Status
          </label>
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
          <label className="block text-sm font-medium text-media mb-2">
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
              className="ml-2 bg-media text-white p-2 rounded"
            >
              Gerar
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-media text-white p-2 rounded mt-4 col-span-3"
        >
          Cadastrar Cliente
        </button>
      </form>
    </div>
  );
};

export default CadastroCliente;
