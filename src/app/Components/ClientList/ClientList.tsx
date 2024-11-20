import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";
// Interface Cliente
interface Cliente {
  id: string;
  nome_responsavel: string;
  nome_igreja: string;
  email: string;
  cnpj_cpf: string;
  endereco: string | null;
  nome_banco: string;
  chave_acesso: string;
  status: "ativo" | "inativo";
  codigo_acesso: string;
  criado_em: string;
  senha: string;
}

// Função para gerar código aleatório
const gerarCodigoAleatorio = (tamanho: number): string => {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const ListaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [senha, setSenha] = useState<string>(""); // Estado para a nova senha
  const [carregando, setCarregando] = useState<boolean>(false);

  // Carregar clientes do backend
  useEffect(() => {
    const fetchClientes = async () => {
      setCarregando(true);
      try {
        const res = await fetch("/api/listagem");
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        toast.error("Erro ao carregar os clientes.");
      } finally {
        setCarregando(false);
      }
    };
    fetchClientes();
  }, []); // Dependência vazia para carregar apenas uma vez ao iniciar

  // Manipular edição
  const handleEditar = (cliente: Cliente) => {
    setEditandoCliente(cliente);
  };

  // Salvar edição de cliente
  const handleSalvarEdicao = async () => {
    if (!editandoCliente) return;

    try {
      // Se a senha for alterada, gerar o hash da nova senha
      const novaSenhaHash = senha
        ? await bcrypt.hash(senha, 10)
        : editandoCliente.senha;

      const res = await fetch(`/api/editClient/${editandoCliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editandoCliente,
          senha: novaSenhaHash, // Atualiza a senha com hash
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar edição");

      const clienteAtualizado = await res.json();
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === editandoCliente.id ? clienteAtualizado : cliente
        )
      );
      toast.success("Cliente atualizado com sucesso!");
      setEditandoCliente(null);
      setSenha(""); // Resetar senha após salvar
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar edição do cliente.");
    }
  };

  // Bloquear/Desbloquear cliente
  const handleAlterarStatus = async (
    clienteId: string,
    novoStatus: "ativo" | "inativo"
  ) => {
    try {
      const res = await fetch(`/api/activeClient/${clienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) throw new Error("Erro ao alterar status");

      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clienteId
            ? { ...cliente, status: novoStatus }
            : cliente
        )
      );
      toast.success(
        `Cliente ${
          novoStatus === "ativo" ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (error) {
      toast.error("Erro ao alterar status do cliente.");
    }
  };

  // Deletar cliente
  const handleDeletar = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/deleteCliente/${clienteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar cliente");

      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteId));
      toast.success("Cliente deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar cliente.");
    }
  };

  // Função para fechar o modal
  const handleFecharModal = () => {
    setEditandoCliente(null);
    setSenha(""); // Resetar a senha ao fechar o modal
  };

  // Função para resetar os campos
  const handleReset = () => {
    if (editandoCliente) {
      setSenha(""); // Resetar a senha ao clicar em reset
      setEditandoCliente({
        ...editandoCliente,
        nome_responsavel: "",
        nome_igreja: "",
        email: "",
        cnpj_cpf: "",
        endereco: "",
        nome_banco: "",
        chave_acesso: "",
        status: "ativo",
        codigo_acesso: gerarCodigoAleatorio(10),
        senha: "",
      });
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h2 className="text-2xl font-bold mb-6">Lista de Clientes</h2>

      {carregando ? (
        <p>Carregando clientes...</p>
      ) : clientes.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        <table className="w-full table-auto border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Nome Responsável</th>
              <th className="border px-4 py-2 text-left">Nome Igreja</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr
                key={`${cliente.id}-${index}`} // Combinação para garantir unicidade
                className="hover:bg-gray-50"
              >
                {/* Nome do responsável */}
                <td className="border px-4 py-2">{cliente.nome_responsavel}</td>

                {/* Nome da igreja */}
                <td className="border px-4 py-2">{cliente.nome_igreja}</td>

                {/* Email */}
                <td className="border px-4 py-2">{cliente.email}</td>

                {/* Status */}
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-white ${
                      cliente.status === "ativo" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </td>

                {/* Ações */}
                <td className="border px-4 py-2 flex gap-4 items-center">
                  {/* Editar cliente */}
                  <FaEdit
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                    size={20}
                    title="Editar"
                    onClick={() => handleEditar(cliente)} // Verifique esta função!
                  />

                  {/* Deletar cliente */}
                  <FaTrash
                    className="text-red-600 cursor-pointer hover:text-red-800"
                    size={20}
                    title="Deletar"
                    onClick={() => handleDeletar(cliente.id)} // Verifique esta função!
                  />

                  {/* Alterar status */}
                  {cliente.status === "ativo" ? (
                    <FaLock
                      className="text-yellow-600 cursor-pointer hover:text-yellow-800"
                      size={20}
                      title="Bloquear"
                      onClick={() => handleAlterarStatus(cliente.id, "inativo")} // Verifique esta função!
                    />
                  ) : (
                    <FaUnlock
                      className="text-green-600 cursor-pointer hover:text-green-800"
                      size={20}
                      title="Ativar"
                      onClick={() => handleAlterarStatus(cliente.id, "ativo")} // Verifique esta função!
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal de edição */}
      {editandoCliente && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="modal-content bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-semibold text-center text-media mb-6">
              Modo Edição de Cliente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  Nome Responsável:
                </label>
                <input
                  type="text"
                  value={editandoCliente.nome_responsavel}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      nome_responsavel: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  Nome Igreja:
                </label>
                <input
                  type="text"
                  value={editandoCliente.nome_igreja}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      nome_igreja: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da igreja"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium  text-media mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  value={editandoCliente.email}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      email: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  CNPJ/CPF:
                </label>
                <input
                  type="text"
                  value={editandoCliente.cnpj_cpf}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      cnpj_cpf: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CNPJ ou CPF"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  Endereço:
                </label>
                <input
                  type="text"
                  value={editandoCliente.endereco}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      endereco: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  Senha:
                </label>
                <input
                  type="text"
                  value={editandoCliente.senha || ""}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      senha: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Senha"
                />
              </div>
              <div className="form-group">
                <label className="block text-gray-700 font-medium text-media mb-2">
                  Chave de Verificação:
                </label>
                <input
                  type="text"
                  value={editandoCliente.codigo_verificacao || ""}
                  onChange={(e) =>
                    setEditandoCliente({
                      ...editandoCliente,
                      codigo_verificacao: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-fraca rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Código de verificação"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={handleSalvarEdicao}
                className="bg-media text-white px-6 py-2 rounded-md hover:bg-fraca focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Salvar
              </button>
              <button
                onClick={handleFecharModal}
                className="bg-red-800 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;
