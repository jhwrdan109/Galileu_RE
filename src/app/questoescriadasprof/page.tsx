"use client";
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  ArrowLeftCircle,
  Eye,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";

interface Questao {
  enunciado: string;
  resolucao: string;
  alternativas: { [key: string]: string };
  incognita: string;
  alternativaCorreta: string;
  respostaCorreta?: string;  // Agora temos respostaCorreta para sensor
  criadoEm: string;
  professor: string;
  isExpanded?: boolean;
}

const QuestoesCriadasProf = () => {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questoesSensores, setQuestoesSensores] = useState<Questao[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.uid);
      setUserName(`Prof. ${user.name || user.email}`);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      const db = getDatabase(app);

      // Busca as questões normais
      const questoesRef = ref(db, `questoes/${userId}`);
      onValue(questoesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listaQuestoes = Object.values(data) as Questao[];
          setQuestoes(listaQuestoes);
        } else {
          setQuestoes([]);
        }
      });

      // Busca as questões com base nos sensores
      const questoesSensoresRef = ref(db, `questoesComBaseNosSensores/${userId}`);
      onValue(questoesSensoresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listaQuestoesSensores = Object.values(data).map((questao: any) => ({
            ...questao,
            respostaCorreta: questao.respostaCorreta,  // Agora inclui respostaCorreta
          })) as Questao[];
          setQuestoesSensores(listaQuestoesSensores);
        } else {
          setQuestoesSensores([]);
        }
      });
    }
  }, [userId]);

  // Função para alternar a exibição dos detalhes das questões
  const alternarDetalhes = (index: number, tipo: "normal" | "sensor") => {
    if (tipo === "normal") {
      const novaLista = [...questoes];
      novaLista[index].isExpanded = !novaLista[index].isExpanded;
      setQuestoes(novaLista);
    } else {
      const novaListaSensores = [...questoesSensores];
      novaListaSensores[index].isExpanded = !novaListaSensores[index].isExpanded;
      setQuestoesSensores(novaListaSensores);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Container */}
        <main className="relative bg-purple-900 bg-opacity-40 p-6 rounded-2xl shadow-xl mb-10">
          {/* Back Button */}
          <button
            onClick={() => router.push("/escolhacriadasoucriarprof")}
            className="absolute top-4 left-4 text-purple-300 hover:text-white transition flex items-center gap-1"
          >
            <ArrowLeftCircle size={24} /> Voltar
          </button>

          <h1 className="text-3xl font-bold mb-6 text-center">Questões Criadas</h1>

          {questoes.length === 0 && questoesSensores.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma questão criada ainda.</p>
          ) : (
            <>
              {/* Container de Questões Normais */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Questões Normais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {questoes.map((questao, index) => (
                    <div
                      key={index}
                      className="bg-purple-800 p-4 rounded-lg shadow-md flex flex-col justify-between"
                    >
                      <h2 className="text-lg font-semibold mb-2">
                        <FileText className="inline mr-2" />
                        {questao.enunciado.length > 60
                          ? questao.enunciado.slice(0, 60) + "..."
                          : questao.enunciado}
                      </h2>
                      <button
                        onClick={() => alternarDetalhes(index, "normal")}
                        className="mt-4 bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Eye size={20} /> {questao.isExpanded ? "Ocultar" : "Ver Detalhes"}
                      </button>
                      {questao.isExpanded && (
                        <div className="mt-4 text-sm text-gray-200">
                          <p><strong>Resolução:</strong> {questao.resolucao}</p>
                          <p><strong>Alternativas:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {Object.entries(questao.alternativas).map(([key, value]) => (
                              <li key={key}>{key} - {value}</li>
                            ))}
                          </ul>
                          <p><strong>Alternativa Correta:</strong> {questao.alternativaCorreta}</p>
                         
                          <p><strong>Criado em:</strong> {new Date(questao.criadoEm).toLocaleString()}</p>
                          <p><strong>Professor:</strong> {questao.professor}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Container de Questões Baseadas em Sensores */}
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Questões Baseadas em Sensores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {questoesSensores.map((questao, index) => (
                    <div
                      key={index}
                      className="bg-purple-800 p-4 rounded-lg shadow-md flex flex-col justify-between"
                    >
                      <h2 className="text-lg font-semibold mb-2">
                        <FileText className="inline mr-2" />
                        {questao.enunciado.length > 60
                          ? questao.enunciado.slice(0, 60) + "..."
                          : questao.enunciado}
                      </h2>
                      <button
                        onClick={() => alternarDetalhes(index, "sensor")}
                        className="mt-4 bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Eye size={20} /> {questao.isExpanded ? "Ocultar" : "Ver Detalhes"}
                      </button>
                      {questao.isExpanded && (
                        <div className="mt-4 text-sm text-gray-200">
                          <p><strong>Resolução:</strong> {questao.resolucao}</p>
                          <p><strong>Alternativas:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {Object.entries(questao.alternativas).map(([key, value]) => (
                              <li key={key}>{key} - {value}</li>
                            ))}
                          </ul>
                          <p><strong>Alternativa Correta:</strong> {questao.respostaCorreta}</p> {/* Usando respostaCorreta aqui */}
                          <p><strong>Incógnita:</strong> {questao.incognita}</p>
                          <p><strong>Criado em:</strong> {new Date(questao.criadoEm).toLocaleString()}</p>
                          <p><strong>Professor:</strong> {questao.professor}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default QuestoesCriadasProf;
