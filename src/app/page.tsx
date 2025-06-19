"use client";

import Header from "../app/header";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRef } from "react";
import '@fontsource/poppins';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const quemSomosRef = useRef<HTMLDivElement>(null); // Referência para scroll

  const scrollToQuemSomos = () => {
    quemSomosRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      {/* Cabeçalho */}
      <Header scrollToQuemSomos={scrollToQuemSomos} />

      <div className="container mx-auto px-4 py-8 pt-48">
        {/* Conteúdo principal */}
        <main className="flex flex-col items-start justify-center py-16">
          <h1 className="text-6xl md:text-4xl font-bold text-white mb-6 max-w-3xl text-left">
            Uma aprendizagem sobre Plano Inclinado de uma forma interativa
          </h1>

          <p className="text-xl text-purple-200 mb-12 max-w-3xl text-left">
            O Projeto Galileu busca melhorar a compreensão da matéria de Plano Inclinado da disciplina de Física, tornando-a mais eficaz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/login")}
              className="bg-purple-600 text-white px-8 py-3 rounded-md hover:bg-purple-500 font-bold transition duration-300"
            >
              Começar Agora
            </button>
          </div>
        </main>
      </div>

      {/* Seção "Quem Somos" (mais compacta) */}
      <div ref={quemSomosRef} className="bg-white py-12  px-6 mt-24 border-t-4 border-purple-950 shadow-lg">
        <div className="max-w-3xl mx-auto text-center ">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Quem Somos</h2>
          <p className="text-base text-gray-800 leading-relaxed">
            Nós somos o Projeto Galileu, buscando melhorar a interação entre professor e aluno.
            Através da interação entre software e hardware, queremos tornar o estudo de Física
            mais acessível e interativo, focando no tema de Plano Inclinado para ajudar estudantes
            a melhorarem seu desempenho em vestibulares. Somos alunos da Fundação Matias Machline,
            cursando o terceiro ano do ensino médio técnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
