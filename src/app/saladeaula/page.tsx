"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { get, ref } from "firebase/database";
import { database } from "../../../lib/firebaseConfig";

const SalaDeAula = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codigo = searchParams.get("codigo");

  const [nomeSala, setNomeSala] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
    } else {
      router.push("/login");
    }

    if (!codigo) return;

    const salaRef = ref(database, `salas/${codigo}`);
    get(salaRef).then((snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        setNomeSala(dados.nomeSala || "Sala sem nome");
      } else {
        alert("Sala não encontrada");
        router.push("/dashboardaluno");
      }
    });
  }, [codigo, router]);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Informações fixas do Professor e Código da Sala */}
      <div className="fixed left-4 top-1/4 bg-transparent p-4 flex flex-col items-start space-y-4 z-20">
        <p className="text-lg font-semibold text-white">Professor: {userName}</p>
        <p className="text-lg font-semibold text-white">Código da Sala: {codigo}</p>
      </div>
    </div>
  );
};

export default SalaDeAula;
