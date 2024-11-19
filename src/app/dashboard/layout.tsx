"use client";
import "../styles/globals.css"; 

import React from "react";
import Sidebar from "../Components/Sidebar/Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Conteúdo ao lado da sidebar, ajustando margem para 4px e altura */}
      <div className="flex-1 ml-[100px] p-6 pt-1 overflow-auto h-full">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
