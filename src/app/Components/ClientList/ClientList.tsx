import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa"; // Ícones adicionais para bloquear/desbloquear
import "react-toastify/dist/ReactToastify.css";

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
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
  }, []);

  // Manipular edição
  const handleEditar = (cliente: Cliente) => {
    setEditandoCliente(cliente);
  };

  // Salvar edição de cliente
  const handleSalvarEdicao = async () => {
    if (!editandoCliente) return;

    try {
      const res = await fetch(`/api/editClient/${editandoCliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editandoCliente, senha }), // Incluindo a senha se for alterada
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
      toast.error("Erro ao salvar edição do cliente.");
    }
  };

  // Bloquear/Desbloquear cliente
  const handleAlterarStatus = async (clienteId: string, novoStatus: "ativo" | "inativo") => {
    try {
      const res = await fetch(`/api/editClient/${clienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) throw new Error("Erro ao alterar status");

      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clienteId ? { ...cliente, status: novoStatus } : cliente
        )
      );
      toast.success(`Cliente ${novoStatus === "ativo" ? "ativado" : "bloqueado"} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao alterar status do cliente.");
    }
  };

  // Deletar cliente
  const handleDeletar = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/deleteCliente/${clienteId}`, { method: "DELETE" });
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
      setEditandoCliente({ ...editandoCliente, nome_responsavel: "", nome_igreja: "", email: "", cnpj_cpf: "", endereco: "", nome_banco: "", chave_acesso: "", status: "ativo", codigo_acesso: gerarCodigoAleatorio(10) });
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
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{cliente.nome_responsavel}</td>
                <td className="border px-4 py-2">{cliente.nome_igreja}</td>
                <td className="border px-4 py-2">{cliente.email}</td>
                <td className="border px-4 py-2">
                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <FaEdit
                    className="text-blue-600 cursor-pointer"
                    size={20}
                    title="Editar"
                    onClick={() => handleEditar(cliente)}
                  />
                  <FaTrash
                    className="text-red-600 cursor-pointer"
                    size={20}
                    title="Deletar"
                    onClick={() => handleDeletar(cliente.id)}
                  />
                  {cliente.status === "ativo" ? (
                    <FaLock
                      className="text-yellow-600 cursor-pointer"
                      size={20}
                      title="Bloquear"
                      onClick={() => handleAlterarStatus(cliente.id, "inativo")}
                    />
                  ) : (
                    <FaUnlock
                      className="text-green-600 cursor-pointer"
                      size={20}
                      title="Ativar"
                      onClick={() => handleAlterarStatus(cliente.id, "ativo")}
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
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Cliente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label htmlFor="nome_responsavel" className="block text-sm font-medium">Nome do Responsável</label>
                <input
                  id="nome_responsavel"
                  type="text"
                  value={editandoCliente.nome_responsavel}
                  onChange={(e) => setEditandoCliente({ ...editandoCliente, nome_responsavel: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="nome_igreja" className="block text-sm font-medium">Nome da Igreja</label>
                <input
                  id="nome_igreja"
                  type="text"
                  value={editandoCliente.nome_igreja}
                  onChange={(e) => setEditandoCliente({ ...editandoCliente, nome_igreja: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  value={editandoCliente.email}
                  onChange={(e) => setEditandoCliente({ ...editandoCliente, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="senha" className="block text-sm font-medium">Nova Senha</label>
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={handleFecharModal} className="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>
              <button onClick={handleSalvarEdicao} className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={handleReset} className="text-sm text-gray-500">Resetar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;
