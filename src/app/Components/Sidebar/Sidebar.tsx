"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaHome,
  FaMoneyCheckAlt,
  FaUsers,
  FaUserShield,
  FaHeadset,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controla o estado de abertura da sidebar em telas pequenas
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Falha ao fazer logout");
      }

      router.push("/login");
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div>
      {/* Botão de hambúrguer para telas pequenas */}
      <button onClick={toggleSidebar} className="lg:hidden p-4 text-white">
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`bg-forte text-white p-4 fixed top-0 left-0 h-screen 
          transition-transform duration-300 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }
          lg:translate-x-0 lg:w-64 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src="/logo.png" alt="Logo" className="w-64 h-20" />
        </div>

        {/* Links da sidebar */}
        <ul className="space-y-4 mt-4 flex-grow">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center text-lg hover:text-white py-3 px-4 rounded-lg transition transform duration-300 hover:shadow-lg hover:scale-105"
            >
              <FaHome className="mr-2" />
              Início
            </Link>
          </li>
          <li>
            <Link
              href="/financeiro"
              className="flex items-center text-lg hover:text-white py-3 px-4 rounded-lg transition transform duration-300 hover:shadow-lg hover:scale-105"
            >
              <FaMoneyCheckAlt className="mr-2" />
              Financeiro
            </Link>
          </li>
          <li>
            <Link
              href="/relatorios"
              className="flex items-center text-lg hover:text-white py-3 px-4 rounded-lg transition transform duration-300 hover:shadow-lg hover:scale-105"
            >
              <VscGraph className="mr-2" />
              Relatórios
            </Link>
          </li>
          <li>
            <Link
              href="/clientes"
              className="flex items-center text-lg hover:text-white py-3 px-4 rounded-lg transition transform duration-300 hover:shadow-lg hover:scale-105"
            >
              <FaUsers className="mr-2" />
              Clientes
            </Link>
          </li>
          <li>
            <Link
              href="/usuarios"
              className="flex items-center text-lg hover:text-white py-3 px-4 rounded-lg transition transform duration-300 hover:shadow-lg hover:scale-105"
            >
              <FaUserShield className="mr-2" />
              Usuários
            </Link>
          </li>
        </ul>

        {/* Rodapé */}
        <div className="space-y-4 mt-auto">
         
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-lg bg-red-500 text-white hover:bg-red-600 py-3 px-4 rounded-lg mt-4 transition transform duration-300 hover:shadow-lg hover:scale-105"
          >
            <FaSignOutAlt className="mr-2" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
