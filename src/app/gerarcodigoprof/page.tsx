"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ref, set, get } from "firebase/database";  // Importando get corretamente
import { database } from "../../../lib/firebaseConfig";

const GerarCodigoprof: React.FC = () => {
  const router = useRouter();
  const [codigo, setCodigoState] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const executou = useRef(false); // controle da execução

  useEffect(() => {
    const gerarEDefinirCodigo = async () => {
      // Verificar se a execução já ocorreu
      if (executou.current) return;
      executou.current = true;

      const gerarCodigoAleatorio = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      const novoCodigo = gerarCodigoAleatorio();
      setCodigoState(novoCodigo);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const nome = user.name || user.email;
        setUserName(`Prof. ${nome}`);

        const now = new Date();
        // Referência do código no Firebase
        const salaRef = ref(database, `salas/${novoCodigo}`);
        
        // Verificando se o código já existe usando get() corretamente
        const snapshot = await get(salaRef);
        if (!snapshot.exists()) {  // Verifica se o código já existe no Firebase
          await set(salaRef, {
            codigo: novoCodigo,
            nomeProfessor: nome,
            dataCriacao: now.toISOString(),
          });
        }
      }
    };

    gerarEDefinirCodigo();
  }, []);  // Mantendo a lista de dependências vazia para garantir execução apenas na primeira renderização

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

        <div className="hidden md:block fixed left-0 bottom-0 z-10">
              <Image
                src="/images/galileuimagem.png"
                alt="Galileu"
                width={300}
                height={300}
                className="object-contain"
              />
            </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10">
          <Image
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={150}
            height={50}
            className="hover:scale-105 transition-transform duration-300"
          />

          <nav>
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <button
                  onClick={() => router.push("/dashboardprof")}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Início
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Simulações
                </button>
              </li>

              <li>
                <button
                  onClick={() => router.push("/editarperfilprof")}
                  className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>
        </header>
      </div>

      {/* Container do Código */}
      <div className="flex flex-col items-center justify-center">
        <div className="bg-purple-900 p-6 rounded-lg shadow-lg border border-purple-300 max-w-md w-full text-center relative">
          {/* Botão de voltar */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:text-purple-300 transition duration-300"
          >
            <ArrowLeft size={32} />
          </button>

          <h1 className="text-3xl font-bold text-white mb-6">Código da Sala</h1>

          <div className="bg-white text-purple-900 text-2xl font-bold p-4 rounded-md border border-gray-300">
            {codigo}
          </div>

          <button
            onClick={() => router.push("/criarsalaprof")}
            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-500 transition duration-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerarCodigoprof;
