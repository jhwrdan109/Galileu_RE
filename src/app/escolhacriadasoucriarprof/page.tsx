"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { database } from "../../../lib/firebaseConfig"; // Certifique-se de ter configurado o Firebase corretamente
import { set, ref } from "firebase/database";

const EscolhasCriadasOuCriarProf: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigoGerado, setCodigoGerado] = useState<string>("");
  const [codigoSalvo, setCodigoSalvo] = useState(false); // Para controlar se o código foi enviado ao Firebase

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  const gerarCodigo = async () => {
    // Verificar se o código já foi gerado e enviado
    if (codigoSalvo) return;

    // Gerar um código único
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase(); // Exemplo de código
    setCodigoGerado(codigo);
    
    // Lógica para enviar ao Firebase
    const salaRef = ref(database, 'salas/' + codigo); // 'salas' é o caminho no Firebase

    try {
      await set(salaRef, {
        nome: "Sala do Professor", // Adapte conforme necessário
        professor: userName,
        dataCriacao: new Date().toISOString(),
        codigo: codigo,
      });
      setCodigoSalvo(true); // Marcar que o código foi enviado ao Firebase
      console.log("Código gerado e salvo no Firebase!");
    } catch (error) {
      console.error("Erro ao salvar o código no Firebase: ", error);
    }
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
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
      }}
    >
      {/* Imagem fixa na esquerda */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileufrente.png"
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div className="mb-6 md:mb-0">
            <Image
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              width={150}
              height={50}
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>

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
                  onClick={() => router.push("/simuproftestesupabase")}
                  className="text-white px-6 py-3 rounded-md font-bold border border-purple-400"
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

        {/* Bloco de escolha */}
        <div className="flex justify-center">
          <div className="bg-purple-800 border border-purple-300 text-white p-8 rounded-xl shadow-lg w-full max-w-md text-center relative">
            <button
              onClick={() => router.push("/simuproftestesupabase")}
              className="absolute top-4 left-4 text-white hover:text-gray-300"
            >
              <ArrowLeft size={28} />
            </button>

            <h1 className="text-3xl font-bold mb-8 mt-2">O que deseja fazer?</h1>

            <button
              onClick={() => router.push("/questoescriadasprof")}
              className="w-full bg-purple-900 hover:bg-purple-950 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-200 mb-4"
            >
              Questões Criadas
            </button>

            <button
              onClick={() => router.push("/criarquestaoprof")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-200 mb-4"
            >
              Criar Questão
            </button>
            <button
                    onClick={() => router.push("/criarquestaodispositivo")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    Criar Questão com base no Aparelho
                  </button>
           

            {/* Exibe o código gerado */}
            {codigoGerado && !codigoSalvo && (
              <div className="mt-4 text-lg font-semibold text-yellow-400">
                Código Gerado: {codigoGerado}
              </div>
            )}

            {/* Mensagem caso o código já tenha sido salvo */}
            {codigoSalvo && (
              <div className="mt-4 text-lg font-semibold text-green-400">
                Código salvo no Firebase!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscolhasCriadasOuCriarProf;
