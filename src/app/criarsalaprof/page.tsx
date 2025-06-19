"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDatabase, ref, set } from "firebase/database";
import { ArrowLeft } from "lucide-react";

interface Questao {
  id: string;
  titulo: string;
  enunciado: string;
  alternativas: string[];
  correta: string;
  explicacao: string;
}

const CriarSalaProf: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [showModalFinalizar, setShowModalFinalizar] = useState(false);
  const [codigoSala, setCodigoSala] = useState<string>(""); // Código gerado
  const [professorId, setProfessorId] = useState<string>(""); // ID do professor
  const [questaoAdicionada, setQuestaoAdicionada] = useState<boolean>(false); // Flag para verificar se a questão foi adicionada
  const [showModalConfirmacao, setShowModalConfirmacao] = useState<boolean>(false); // Modal de confirmação de código

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      const uid = user.uid;
      setProfessorId(uid);
      setUserName(`Prof. ${user.name || user.email}`);
    } else {
      router.push("/login");
    }
  }, [router]);

  const gerarCodigo = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleAdicionarQuestoes = () => {
    setQuestaoAdicionada(true); // Quando adicionar a questão, marque como adicionada
    router.push("/adicionarquestaoprof"); // Navegar para a página de adicionar questões
  };

  const handleFinalizarAula = () => {
    setShowModalFinalizar(false);
    router.push("/simulacoesprof");
  };

  const handleProntoGerarCodigo = () => {
    setShowModalConfirmacao(true); // Exibe o modal para confirmação de geração do código
  };

  const handleConfirmarGerarCodigo = async () => {
    const novoCodigo = gerarCodigo();
    setCodigoSala(novoCodigo); // Atualiza o código da sala
    setShowModalConfirmacao(false); // Fecha o modal de confirmação

    // Atualiza o banco de dados
    const db = getDatabase();
    const salaRef = ref(db, `salasPorProfessor/${professorId}/${novoCodigo}`);
    set(salaRef, {
      codigo: novoCodigo,
      criadoEm: new Date().toISOString(),
      nomeProfessor: userName,
    });
  };

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
                <button onClick={() => router.push("/dashboardprof")} className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300">Início</button>
              </li>
             
              <li>
                <button className="text-white px-6 py-3 rounded-md font-bold border border-purple-400">Simulações</button>
              </li>
              <li>
                <button onClick={() => router.push("/editarperfilprof")} className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300">
                  {userName}
                </button>
              </li>
            </ul>
          </nav>
        </header>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-purple-900 p-5 rounded-lg shadow-lg border border-purple-300 max-w-lg w-full relative">
          <h1 className="text-4xl font-bold text-white mb-2">Criar Sala</h1>

          {/* Exibir código apenas após gerar o código */}
          {codigoSala && (
            <p className="text-white text-lg mb-6">
              Código da sala: <span className="font-mono text-green-400">{codigoSala}</span>
            </p>
          )}

          <div className="flex flex-col gap-4">
            <button onClick={handleAdicionarQuestoes} className="bg-gray-200 text-black py-3 rounded-md font-bold hover:bg-gray-300 transition duration-300">
              ➕ Adicionar Questões Criadas
            </button>
            <button 
              onClick={() => router.push("/gerarcodigoprof")} 
              className="bg-blue-500 text-white py-3 rounded-md font-bold hover:bg-blue-400 transition duration-300"
            >
              ✅ Gerar Código
            </button>
            <button onClick={() => setShowModalFinalizar(true)} className="bg-red-600 text-white py-3 rounded-md font-bold hover:bg-red-500 transition duration-300">
              ✅ Finalizar Aula
            </button>
          </div>
        </div>
      </div>

      {/* Galileu */}
      <div className="hidden md:block fixed right-0 bottom-0 z-10">
        <Image src="/images/galileufrente.png" alt="Galileu" width={300} height={300} className="object-contain" />
      </div>

      {/* Modal de Confirmar Geração de Código */}
      {showModalConfirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-purple-800 border border-purple-300 p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-lg font-bold mb-4 text-white">Você já adicionou todas as questões desejadas? Não será possível adicionar mais questões depois.</h2>
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirmarGerarCodigo} className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-500 transition duration-300">Sim</button>
              <button onClick={() => setShowModalConfirmacao(false)} className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-900 transition duration-300">Não</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalizar Aula */}
      {showModalFinalizar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-purple-800 border border-purple-300 p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-lg font-bold mb-4 text-white">Tem certeza que deseja finalizar a aula?</h2>
            <div className="flex justify-center gap-4">
              <button onClick={handleFinalizarAula} className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-500 transition duration-300">Sim</button>
              <button onClick={() => setShowModalFinalizar(false)} className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-900 transition duration-300">Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriarSalaProf;
