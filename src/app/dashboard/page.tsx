// pages/dashboard/index.tsx
"use client";

import React from "react";
import Layout from "./layout";
import CadastroCliente from "../Components/CadastroCliente/CadastroCliente";
import ClientList from "../Components/ClientList/ClientList";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="space-y-5 p-4">
        <CadastroCliente />
        <ClientList />
      </div>
    </Layout>
  );
};

export default DashboardPage;
