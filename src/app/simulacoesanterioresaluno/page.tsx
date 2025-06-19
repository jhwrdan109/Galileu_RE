"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import CloseIcon from "@mui/icons-material/Close";

interface Simulacao {
  id: string;
  userName: string;
  timestamp: string;
  status: string;
  dados: {
    distancia: number;
    angulo: number;
    velocidade: number;
    px: number;
    py: number;
    aceleracao: number;
    forcaPeso: number;
    forcaNormal: number;
    forcaAtrito: number;
    forcaResultante: number;
  };
}

const SimulacoesAnterioresAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [simulacaoSelecionada, setSimulacaoSelecionada] = useState<Simulacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados para o modo de comparação
  const [modoComparacao, setModoComparacao] = useState(false);
  const [simulacoesSelecionadas, setSimulacoesSelecionadas] = useState<Simulacao[]>([]);
  const [modalComparacaoAberto, setModalComparacaoAberto] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
      setLoading(false);
      carregarSimulacoes(user.name || user.email);
    } else {
      router.push("/login");
    }
  }, [router]);

  const carregarSimulacoes = (userNome: string) => {
    const database = getDatabase(app);
    const simulacoesRef = ref(database, "simulacoes");

    onValue(simulacoesRef, (snapshot) => {
      if (snapshot.exists()) {
        const simulacoesData = snapshot.val();
        const simulacoesArray: Simulacao[] = [];

        Object.keys(simulacoesData).forEach((key) => {
          if (simulacoesData[key].userName === userNome) {
            simulacoesArray.push({
              id: key,
              ...simulacoesData[key],
              dados: simulacoesData[key].dados || {},
            });
          }
        });

        simulacoesArray.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setSimulacoes(simulacoesArray);
      }
    });
  };

  const abrirModal = (simulacao: Simulacao) => {
    if (modoComparacao) {
      selecionarParaComparacao(simulacao);
    } else {
      setSimulacaoSelecionada(simulacao);
      setModalAberto(true);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSimulacaoSelecionada(null);
  };

  const formatarData = (timestamp: string) => {
    if (!timestamp) return "Data não disponível";
    const data = new Date(timestamp);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Funções para a comparação
  const toggleModoComparacao = () => {
    setModoComparacao(!modoComparacao);
    setSimulacoesSelecionadas([]);
  };

  const selecionarParaComparacao = (simulacao: Simulacao) => {
    if (simulacoesSelecionadas.find(s => s.id === simulacao.id)) {
      // Remover se já estiver selecionada
      setSimulacoesSelecionadas(simulacoesSelecionadas.filter(s => s.id !== simulacao.id));
    } else {
      // Adicionar, mantendo no máximo 2 seleções
      const novaSelecao = [...simulacoesSelecionadas, simulacao].slice(-2);
      setSimulacoesSelecionadas(novaSelecao);
      
      // Se tiver 2 simulações selecionadas, abrir o modal de comparação
      if (novaSelecao.length === 2) {
        setModalComparacaoAberto(true);
      }
    }
  };

  const fecharModalComparacao = () => {
    setModalComparacaoAberto(false);
    setModoComparacao(false);
    setSimulacoesSelecionadas([]);
  };

  const DetalhesModal = () => {
    if (!simulacaoSelecionada) return null;
    const { timestamp, dados } = simulacaoSelecionada;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-purple-800">
              Detalhes da Simulação
            </h2>
            <button
              onClick={fecharModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-lg font-medium mb-4 text-black">
              <span className="text-purple-600">Data da Simulação:</span>{" "}
              {formatarData(timestamp)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-purple-800">
                  Medidas
                </h3>
                <div className="space-y-2 text-black">
                  <p>
                    <span className="font-semibold">Distância:</span>{" "}
                    {dados?.distancia?.toFixed(2) || "N/A"} m
                  </p>
                  <p>
                    <span className="font-semibold">Ângulo:</span>{" "}
                    {dados?.angulo?.toFixed(2) || "N/A"}°
                  </p>
                  <p>
                    <span className="font-semibold">Velocidade:</span>{" "}
                    {dados?.velocidade?.toFixed(2) || "N/A"} m/s
                  </p>
                  <p>
                    <span className="font-semibold">Aceleração:</span>{" "}
                    {dados?.aceleracao?.toFixed(2) || "N/A"} m/s²
                  </p>
                </div>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-purple-800">
                  Forças
                </h3>
                <div className="space-y-2 text-black">
                  <p>
                    <span className="font-semibold">Força Peso:</span>{" "}
                    {dados?.forcaPeso?.toFixed(2) || "N/A"} N
                  </p>
                  <p>
                    <span className="font-semibold">Força Normal:</span>{" "}
                    {dados?.forcaNormal?.toFixed(2) || "N/A"} N
                  </p>
                  <p>
                    <span className="font-semibold">Força de Atrito:</span>{" "}
                    {dados?.forcaAtrito?.toFixed(2) || "N/A"} N
                  </p>
                  <p>
                    <span className="font-semibold">Força Resultante:</span>{" "}
                    {dados?.forcaResultante?.toFixed(2) || "N/A"} N
                  </p>
                  <p>
                    <span className="font-semibold">Px / Py:</span>{" "}
                    {dados?.px?.toFixed(2) || "N/A"} /{" "}
                    {dados?.py?.toFixed(2) || "N/A"} N
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={fecharModal}
                className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold hover:bg-purple-700 transition duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComparacaoModal = () => {
    if (simulacoesSelecionadas.length !== 2) return null;
    
    const simulacao1 = simulacoesSelecionadas[0];
    const simulacao2 = simulacoesSelecionadas[1];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-purple-800">
              Comparação de Simulações
            </h2>
            <button
              onClick={fecharModalComparacao}
              className="text-gray-500 hover:text-gray-700"
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-purple-800">
                  Experimento 1
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formatarData(simulacao1.timestamp)}
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-purple-800">
                  Experimento 2
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formatarData(simulacao2.timestamp)}
                </p>
              </div>
            </div>

            {/* Aceleração */}
            <div className="mb-4">
              <div className=" text-purple-950 font-bold text-center py-2 bg-gray-200">Aceleração</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao1.dados?.aceleracao?.toFixed(2) || "N/A"} m/s²
                </div>
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao2.dados?.aceleracao?.toFixed(2) || "N/A"} m/s²
                </div>
              </div>
            </div>

            {/* Força Peso */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center  py-2 bg-gray-200">Força Peso</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao1.dados?.forcaPeso?.toFixed(2) || "N/A"} N
                </div>
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao2.dados?.forcaPeso?.toFixed(2) || "N/A"} N
                </div>
              </div>
            </div>

            {/* Força Atrito */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200">Força Atrito</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao1.dados?.forcaAtrito?.toFixed(2) || "N/A"} N
                </div>
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao2.dados?.forcaAtrito?.toFixed(2) || "N/A"} N
                </div>
              </div>
            </div>

            {/* Px/Py */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200">Px/Py</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao1.dados?.px?.toFixed(2) || "N/A"} / {simulacao1.dados?.py?.toFixed(2) || "N/A"} N
                </div>
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao2.dados?.px?.toFixed(2) || "N/A"} / {simulacao2.dados?.py?.toFixed(2) || "N/A"} N
                </div>
              </div>
            </div>

            {/* Força Normal */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200">Força Normal</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao1.dados?.forcaNormal?.toFixed(2) || "N/A"} N
                </div>
                <div className="bg-purple-600 text-white text-center py-3 rounded">
                  {simulacao2.dados?.forcaNormal?.toFixed(2) || "N/A"} N
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={fecharModalComparacao}
                className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold hover:bg-purple-700 transition duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="hidden md:block fixed right-0 bottom-0 z-10">
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
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/quemsomosaluno")}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Quem Somos
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white px-6 py-3 rounded-md font-bold border border-purple-400"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <main className="flex flex-col items-center text-center py-16">
          <div className="bg-purple-800 text-white px-8 py-6 rounded-lg shadow-lg mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push("/simulacoesaluno")}
              className="text-white hover:text-gray-300"
            >
              <ArrowBackIcon fontSize="large" />
            </button>
            <h1 className="text-4xl font-bold">Simulações Anteriores</h1>
          </div>

          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              {simulacoes.length >= 2 && (
                <button
                  onClick={toggleModoComparacao}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-bold transition duration-300 ${
                    modoComparacao
                      ? "bg-purple-800 text-white"
                      : "bg-purple-200 text-purple-800"
                  }`}
                >
                  <CompareArrowsIcon />
                  {modoComparacao ? "Cancelar Comparação" : "Comparar Simulações"}
                </button>
              )}
              
              {modoComparacao && (
                <div className="text-white bg-purple-950 py-2 px-3 border border-purple-300 rounded-lg shadow-lg">
                  {simulacoesSelecionadas.length === 0 && "Selecione duas simulações para comparar"}
                  {simulacoesSelecionadas.length === 1 && "Selecione mais uma simulação"}
                  {simulacoesSelecionadas.length === 2 && "Duas simulações selecionadas"}
                </div>
              )}
            </div>

            <div className="bg-purple-200 bg-opacity-20 rounded-lg p-8">
              {simulacoes.length > 0 ? (
                <div className="space-y-4">
                  {simulacoes.map((simulacao) => (
                    <div
                      key={simulacao.id}
                      className={`bg-white p-6 rounded-lg shadow-md hover:bg-purple-50 transition duration-300 cursor-pointer ${
                        modoComparacao && simulacoesSelecionadas.find(s => s.id === simulacao.id)
                          ? "border-4 border-purple-600"
                          : ""
                      }`}
                      onClick={() => abrirModal(simulacao)}
                    >
                      <h2 className="text-xl font-bold text-purple-800 mb-2">
                        Simulação em {formatarData(simulacao.timestamp)}
                      </h2>
                      <p className="text-gray-700">Status: {simulacao.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white text-lg">Nenhuma simulação encontrada.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalAberto && <DetalhesModal />}
      {modalComparacaoAberto && <ComparacaoModal />}
    </div>
  );
};

export default SimulacoesAnterioresAluno;