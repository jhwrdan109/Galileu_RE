"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SimulacoesAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl">
        Carregando...
      </div>
    );
  }

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
      {/* Imagem fixa na esquerda */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileuimagem.png"
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div className="mb-6 md:mb-0">
            <Image
              onClick={() => router.push("/dashboardaluno")}
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              width={150}
              height={50}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </div>

          <nav>
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <button
                  onClick={() => router.push("/dashboardaluno")}
                  className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Início
                </button>
              </li>
             
              <li>
                <button
                  className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <main className="flex flex-col items-center justify-center text-center py-16">
          <h1 className="text-6xl md:text-4xl font-bold text-white mb-8">
            Simulações
          </h1>
          <div className="flex flex-col gap-6">
            <button
              onClick={() => router.push("/codigoaluno")}
              className="bg-gray-200 text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
              ▶ Entrar na Simulação
            </button>
            <button
              onClick={() => router.push("/analisegeraltesteum")}
              className="bg-gray-200 text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
              Teste 1 de Análise
            </button>
            <button
              onClick={() => router.push("/simulacoesanterioresaluno")}
              className="bg-gray-200 text-black px-6 py-3 rounded-md font-bold flex items-center gap-2 text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
              🔍 Simulações Anteriores
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimulacoesAluno;
