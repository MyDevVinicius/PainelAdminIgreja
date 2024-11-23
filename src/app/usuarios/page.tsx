"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";

const CadastroUsuario = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<"admin" | "gerente">("gerente");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [editUsuario, setEditUsuario] = useState<any>(null); // Estado para armazenar o usuário em edição

  // Carregar a lista de usuários
  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/listUser/");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        toast.error("Erro ao carregar usuários!");
      }
    } catch (error) {
      toast.error("Erro ao carregar usuários!");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Submeter o formulário para cadastrar um novo usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      toast.error("Todos os campos são obrigatórios!");
      return;
    }

    const usuario = { nome, email, senha, role };

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (res.ok) {
        toast.success("Usuário cadastrado com sucesso!");
        setNome("");
        setEmail("");
        setSenha("");
        setRole("gerente");
        fetchUsuarios();
      } else {
        const error = await res.json();
        toast.error(`Erro: ${error.message || "Falha no cadastro"}`);
      }
    } catch (error) {
      toast.error("Erro ao cadastrar usuário. Tente novamente.");
    }
  };

  // Deletar um usuário
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/usuarios/delete/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Usuário deletado com sucesso!");
        fetchUsuarios();
      } else {
        toast.error("Erro ao deletar usuário!");
      }
    } catch (error) {
      toast.error("Erro ao deletar usuário.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editUsuario) return;

    // Verifica se a senha foi alterada e, se sim, cria um hash da senha
    let usuarioEditado = { ...editUsuario };

    if (usuarioEditado.senha) {
      const salt = await bcrypt.genSalt(10); // Gera um salt
      const hashedPassword = await bcrypt.hash(usuarioEditado.senha, salt); // Gera o hash da senha
      usuarioEditado.senha = hashedPassword; // Substitui a senha pela versão hashada
    }

    try {
      const res = await fetch(`/api/usuarios/editar/${editUsuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioEditado),
      });

      if (res.ok) {
        toast.success("Usuário atualizado com sucesso!");
        setEditUsuario(null); // Fecha o formulário de edição
        fetchUsuarios(); // Recarrega a lista de usuários após a edição
      } else {
        toast.error("Erro ao atualizar usuário!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar usuário.");
    }
  };

  const handleCancelEdit = () => {
    setEditUsuario(null); // Fecha o formulário de edição sem salvar alterações
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-10">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center text-media">
        Cadastro de Usuário
      </h2>

      {/* Formulário de Cadastro */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Coluna 1 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-media mb-2">
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded font-bold text-media border-media"
            required
          />
        </div>

        {/* Coluna 2 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-media mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded font-bold text-media border-media"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-media mb-2">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border rounded font-bold text-media border-media"
            required
          />
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-media mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "gerente")}
            className="w-full p-2 border rounded font-bold text-media border-media"
          >
            <option value="gerente">Gerente</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-media text-white p-2 rounded mt-4 col-span-3"
        >
          Cadastrar Usuário
        </button>
      </form>

      {/* Tabela de Usuários */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-media">
          Usuários Cadastrados
        </h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-media px-4 py-2">Nome</th>
              <th className="border border-media px-4 py-2">Email</th>
              <th className="border border-media px-4 py-2">Role</th>
              <th className="border border-media px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario: any) => (
              <tr key={usuario.id}>
                <td className="border border-media px-4 py-2 font-bold">
                  {usuario.nome}
                </td>
                <td className="border border-media px-4 py-2 text-center font-bold">
                  {usuario.email}
                </td>
                <td className="border border-media px-4 py-2 text-center font-bold">
                  {usuario.role}
                </td>
                <td className="border border-media px-4 py-2 text-center">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 font-bold"
                    onClick={() => setEditUsuario(usuario)} // Abre o formulário para editar
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded font-bold"
                    onClick={() => handleDelete(usuario.id)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulário para editar usuário (exibe apenas quando um usuário é selecionado) */}
      {editUsuario && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-media">Editar Usuário</h2>
          <form onSubmit={handleEdit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-media">
                Nome
              </label>
              <input
                type="text"
                value={editUsuario.nome}
                onChange={(e) =>
                  setEditUsuario({ ...editUsuario, nome: e.target.value })
                }
                className="w-full p-2 border rounded border-media"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-media">
                Email
              </label>
              <input
                type="email"
                value={editUsuario.email}
                onChange={(e) =>
                  setEditUsuario({ ...editUsuario, email: e.target.value })
                }
                className="w-full p-2 border rounded border-media"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-media">
                Senha
              </label>
              <input
                type="password"
                value={editUsuario.senha}
                onChange={(e) =>
                  setEditUsuario({ ...editUsuario, senha: e.target.value })
                }
                className="w-md p-2 border rounded border-media"
              />
            </div>
            <button
              type="submit"
              className="w-md bg-media text-white p-2 rounded mt-4 mr-2 font-bold"
            >
              Atualizar Usuário
            </button>
            <button
              type="button"
              className="w-md bg-red-500 text-white p-2 rounded mt-2 ml-4 font-bold"
              onClick={handleCancelEdit} // Cancela a edição
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CadastroUsuario;
