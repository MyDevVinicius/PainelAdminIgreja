"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se os campos estão vazios
    if (!email || !senha) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Login realizado com sucesso!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      toast.error(data.message || "Erro ao fazer login!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col items-center w-full max-w-sm md:max-w-md lg:max-w-lg p-6">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-[400px] h-[120px]" // Define a largura e altura manualmente
          />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-media">
          Painel de Controle
        </h1>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-textlogo">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-media rounded-lg focus:outline-none focus:ring-2 focus:ring-textlogo"
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-textlogo">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-media rounded-lg focus:outline-none focus:ring-2 focus:ring-textlogo"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-forte text-white py-3 rounded-lg hover:bg-media focus:outline-none focus:ring-4 focus:ring-media"
          >
            Entrar
          </button>
        </form>
      </div>
      {/* Contêiner de notificações */}
      <ToastContainer
        position="top-right" // Define o posicionamento no canto superior direito
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition="slide" // Adiciona o efeito de slide
      />
    </div>
  );
}
