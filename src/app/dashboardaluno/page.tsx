"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Dashboardaluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const quemSomosRef = useRef<HTMLDivElement>(null); // Referência para rolar até a seção

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

  const scrollToQuemSomos = () => {
    quemSomosRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl">
        Carregando...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <Image
            onClick={() => router.push("/")}
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={150}
            height={50}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
          />

          <nav>
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <button
                  className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
                  onClick={() => router.push("")}
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToQuemSomos}
                  className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Quem Somos
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
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

        <main className="flex flex-col items-start justify-center py-16">
          <h1 className="text-6xl md:text-4xl font-bold text-white mb-6 max-w-3xl text-left">
            Uma aprendizagem sobre Plano Inclinado de uma forma interativa
          </h1>

          <p className="text-xl text-purple-200 mb-12 max-w-3xl text-left">
            O Projeto Galileu busca melhorar a compreensão da matéria de Plano
            Inclinado da disciplina de Física, tornando-a mais eficaz.
          </p>
        </main>
      </div>

      {/* Seção Quem Somos totalmente larga e rolável */}
      <div
        ref={quemSomosRef}
        className="bg-white py-12  px-6 mt-24 border-t-4 border-purple-950 shadow-lg"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Quem Somos</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            Nós somos o Projeto Galileu, buscando melhorar a interação entre
            professor e aluno. Através da interação entre software e hardware,
            queremos tornar o estudo de Física mais acessível e interativo,
            focando no tema de Plano Inclinado para ajudar estudantes a
            melhorarem seu desempenho em vestibulares. Somos alunos da Fundação
            Matias Machline, cursando o terceiro ano do ensino médio técnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboardaluno;
