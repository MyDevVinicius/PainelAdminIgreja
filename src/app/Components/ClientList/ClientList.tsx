import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
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
  const gerarCodigoAleatorio = () => {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let codigo = "";
    for (let i = 0; i < 15; i++) {
      codigo += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return codigo;
  };

  // Função para gerar código de verificação
  const gerarCodigoVerificacao = () => {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let codigo = "";
    for (let i = 0; i < 10; i++) {
      codigo += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return codigo;
  };

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

  const handleEditar = (cliente: Cliente) => {
    setEditandoCliente(cliente);
  };

  const handleSalvarEdicao = async () => {
    if (editandoCliente) {
      try {
        const res = await fetch(`/api/editClient/${editandoCliente.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editandoCliente),
        });

        if (res.ok) {
          toast.success("Cliente atualizado com sucesso!");
          setClientes((prevClientes) =>
            prevClientes.map((cliente) =>
              cliente.id === editandoCliente.id ? editandoCliente : cliente
            )
          );
          setEditandoCliente(null);
        } else {
          toast.error("Erro ao atualizar cliente.");
        }
      } catch (error) {
        toast.error("Erro ao salvar a edição.");
      }
    }
  };

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

  // Função para fechar o modal
  const handleFecharModal = () => {
    setEditandoCliente(null);
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
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="border-b px-4 py-2">{cliente.nome_responsavel}</td>
              <td className="border-b px-4 py-2">{cliente.nome_igreja}</td>
              <td className="border-b px-4 py-2">{cliente.email}</td>
              <td className="border-b px-4 py-2">{cliente.cnpj_cpf}</td>
              <td className="border-b px-4 py-2">{cliente.nome_banco}</td>
              <td className="border-b px-4 py-2">{cliente.status}</td>
              <td className="border-b px-4 py-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleEditar(cliente)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={() => handleDeletar(cliente.id)}
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editandoCliente && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
          <div className="flex justify-end mb-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={handleFecharModal}
            >
              Fechar
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSalvarEdicao}
            >
              Salvar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Responsável
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
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Igreja
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
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={editandoCliente.email}
                onChange={(e) =>
                  setEditandoCliente({
                    ...editandoCliente,
                    email: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CNPJ/CPF</label>
              <input
                type="text"
                value={editandoCliente.cnpj_cpf}
                onChange={(e) =>
                  setEditandoCliente({
                    ...editandoCliente,
                    cnpj_cpf: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Banco</label>
              <input
                type="text"
                value={editandoCliente.nome_banco}
                onChange={(e) =>
                  setEditandoCliente({
                    ...editandoCliente,
                    nome_banco: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={editandoCliente.status}
                onChange={(e) =>
                  setEditandoCliente({
                    ...editandoCliente,
                    status: e.target.value as "ativo" | "inativo",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Chave de Acesso
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={editandoCliente.chave_acesso}
                  readOnly
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() =>
                    setEditandoCliente({
                      ...editandoCliente,
                      chave_acesso: gerarCodigoAleatorio(),
                    })
                  }
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Gerar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Código de Verificação
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={editandoCliente.codigo_verificacao}
                  readOnly
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() =>
                    setEditandoCliente({
                      ...editandoCliente,
                      codigo_verificacao: gerarCodigoVerificacao(),
                    })
                  }
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Gerar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <input
                type="text"
                value={editandoCliente.endereco || ""}
                onChange={(e) =>
                  setEditandoCliente({
                    ...editandoCliente,
                    endereco: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;
