import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaEdit, FaTrash, FaKey } from "react-icons/fa"; // Ícones de edição, exclusão e chave
import "react-toastify/dist/ReactToastify.css";

interface Cliente {
  id: string;
  nome_responsavel: string;
  nome_igreja: string;
  email: string;
  cnpj_cpf: string;
  endereco: string | null;
  nome_banco: string;
  chave_acesso: string;
  codigo_verificacao: string;
  status: "ativo" | "inativo";
  criado_em: string;
}

const ListaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);

  // Função para gerar código aleatório
  const gerarCodigoAleatorio = (): string => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let codigo = "";
    for (let i = 0; i < 15; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  // Função para gerar código de verificação
  const gerarCodigoVerificacao = (): string => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let codigo = "";
    for (let i = 0; i < 10; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  // Carregar clientes do backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch("/api/listagem");
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        toast.error("Erro ao carregar os clientes.");
      }
    };

    fetchClientes();
  }, []);

  // Manipulador de edição de cliente
  const handleEditar = (cliente: Cliente) => {
    setEditandoCliente(cliente);
  };

  // Salvar edição de cliente
  const handleSalvarEdicao = async () => {
    if (editandoCliente) {
      try {
        const res = await fetch(`/api/editClient/${editandoCliente.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome_responsavel: editandoCliente.nome_responsavel,
            nome_igreja: editandoCliente.nome_igreja,
            email: editandoCliente.email,
            cnpj_cpf: editandoCliente.cnpj_cpf,
            endereco: editandoCliente.endereco,
            chave_acesso: editandoCliente.chave_acesso, // Chave de acesso no corpo da requisição
          }),
        });

        if (res.ok) {
          const updatedCliente = await res.json(); // Obtém os dados atualizados do cliente
          toast.success("Cliente e chave de acesso atualizados com sucesso!");

          // Atualiza a lista de clientes localmente
          setClientes((prevClientes) =>
            prevClientes.map((cliente) =>
              cliente.id === editandoCliente.id ? updatedCliente : cliente
            )
          );

          // Reseta o cliente em edição
          setEditandoCliente(null);
        } else {
          toast.error("Erro ao atualizar cliente.");
        }
      } catch (error) {
        console.error("Erro ao salvar a edição:", error);
        toast.error("Erro ao salvar a edição.");
      }
    }
  };

  // Deletar cliente
  const handleDeletar = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/deleteCliente/${clienteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cliente deletado com sucesso!");
        setClientes((prevClientes) =>
          prevClientes.filter((cliente) => cliente.id !== clienteId)
        );
      } else {
        toast.error("Erro ao deletar cliente.");
      }
    } catch (error) {
      toast.error("Erro ao deletar cliente.");
    }
  };

  // Fechar modal de edição
  const handleFecharModal = () => {
    setEditandoCliente(null);
  };

  // Gerar chave de acesso ao clicar no botão
  const handleGerarChaveAcesso = () => {
    if (editandoCliente) {
      const chaveAcesso = gerarCodigoAleatorio();
      setEditandoCliente((prev) =>
        prev ? { ...prev, chave_acesso: chaveAcesso } : prev
      );
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h2 className="text-2xl font-bold mb-6">Lista de Clientes</h2>
      <table className="w-full table-auto border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-b px-4 py-2 text-left">Nome Responsável</th>
            <th className="border-b px-4 py-2 text-left">Nome Igreja</th>
            <th className="border-b px-4 py-2 text-left">Email</th>
            <th className="border-b px-4 py-2 text-left">CNPJ/CPF</th>
            <th className="border-b px-4 py-2 text-left">Banco</th>
            <th className="border-b px-4 py-2 text-left">Status</th>
            <th className="border-b px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
  {clientes && clientes.length > 0 ? (
    clientes.map((cliente) => (
      cliente.id ? (
        <tr key={cliente.id} className="hover:bg-gray-50">
          <td className="border-b px-4 py-2">{cliente.nome_responsavel}</td>
          <td className="border-b px-4 py-2">{cliente.nome_igreja}</td>
          <td className="border-b px-4 py-2">{cliente.email}</td>
          <td className="border-b px-4 py-2">{cliente.cnpj_cpf}</td>
          <td className="border-b px-4 py-2">{cliente.nome_banco}</td>
          <td className="border-b px-4 py-2">{cliente.status}</td>
          <td className="border-b px-4 py-2 flex gap-2">
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
          </td>
        </tr>
      ) : null
    ))
  ) : (
    <tr><td colSpan={7}>Nenhum cliente encontrado</td></tr>
  )}
</tbody>

      </table>

      {editandoCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
            <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
            <form>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="nome_responsavel" className="text-sm font-medium mb-1">Nome do Responsável</label>
                  <input
                    id="nome_responsavel"
                    type="text"
                    value={editandoCliente.nome_responsavel}
                    onChange={(e) => setEditandoCliente({ ...editandoCliente, nome_responsavel: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="nome_igreja" className="text-sm font-medium mb-1">Nome da Igreja</label>
                  <input
                    id="nome_igreja"
                    type="text"
                    value={editandoCliente.nome_igreja}
                    onChange={(e) => setEditandoCliente({ ...editandoCliente, nome_igreja: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-medium mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={editandoCliente.email}
                    onChange={(e) => setEditandoCliente({ ...editandoCliente, email: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cnpj_cpf" className="text-sm font-medium mb-1">CNPJ/CPF</label>
                  <input
                    id="cnpj_cpf"
                    type="text"
                    value={editandoCliente.cnpj_cpf}
                    onChange={(e) => setEditandoCliente({ ...editandoCliente, cnpj_cpf: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="endereco" className="text-sm font-medium mb-1">Endereço</label>
                  <input
                    id="endereco"
                    type="text"
                    value={editandoCliente.endereco || ""}
                    onChange={(e) => setEditandoCliente({ ...editandoCliente, endereco: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="chave_acesso" className="text-sm font-medium mb-1">Chave de Acesso</label>
                  <input
                    id="chave_acesso"
                    type="text"
                    value={editandoCliente.chave_acesso}
                    disabled
                    className="px-3 py-2 border rounded-md bg-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleGerarChaveAcesso}
                    className="text-white bg-blue-500 mt-2 px-4 py-2 rounded-md"
                  >
                    Gerar nova chave de acesso
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleFecharModal}
                  className="text-red-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarEdicao}
                  className="text-white bg-green-600 px-4 py-2 rounded-md"
                >
                  Salvar Edição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;
