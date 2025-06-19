"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../../lib/supabase";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../../../lib/firebaseConfig"; // Importe sua configuração do Firebase

interface Questao {
  id: string;
  enunciado: string;
  alternativas: { [key: string]: string };
  resolucao?: string;
  alternativa_correta?: string;
  tempo?: number;
  anexo?: string | null;
}

interface Sala {
  id: string;
  nome: string;
  codigo: string;
  questoes_firebase_ids: string[];
  
  created_by_user_id: string;
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

const planoInclinadoFAQs: FAQ[] = [
  {
    pergunta: "O que é um plano inclinado?",
    resposta:
      "Um plano inclinado é uma superfície plana que forma um ângulo com a horizontal. É uma máquina simples que permite mover objetos para cima com menos força do que seria necessário para levantá-los verticalmente."
  },
  {
    pergunta: "Quais são as forças que atuam em um objeto sobre um plano inclinado?",
    resposta:
      "Em um objeto sobre um plano inclinado atuam: a força peso (P), que pode ser decomposta em uma componente paralela ao plano (Px) e uma componente perpendicular ao plano (Py); a força normal (N), perpendicular à superfície; e a força de atrito (Fa), que é paralela à superfície e oposta ao movimento."
  },
  {
    pergunta: "Como calcular a componente da força peso paralela ao plano inclinado?",
    resposta:
      "A componente da força peso paralela ao plano inclinado é dada por: Px = m·g·sen(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a componente da força peso perpendicular ao plano inclinado?",
    resposta:
      "A componente da força peso perpendicular ao plano inclinado é dada por: Py = m·g·cos(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a força normal em um plano inclinado?",
    resposta:
      "A força normal é igual à componente perpendicular do peso: N = m·g·cos(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a força de atrito em um plano inclinado?",
    resposta:
      "A força de atrito é dada por: Fa = μ·N, onde μ é o coeficiente de atrito entre as superfícies e N é a força normal. Substituindo, temos: Fa = μ·m·g·cos(θ)."
  },
  {
    pergunta: "Qual é a condição para que um objeto desça um plano inclinado?",
    resposta:
      "Um objeto deslizará para baixo em um plano inclinado quando a componente da força peso paralela ao plano (Px = m·g·sen(θ)) for maior que a força de atrito (Fa = μ·m·g·cos(θ)). Ou seja, quando sen(θ) > μ·cos(θ), ou quando tg(θ) > μ."
  },
  {
    pergunta: "Como calcular a aceleração de um objeto em um plano inclinado sem atrito?",
    resposta:
      "A aceleração de um objeto em um plano inclinado sem atrito é dada por: a = g·sen(θ), onde g é a aceleração da gravidade e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a aceleração de um objeto em um plano inclinado com atrito?",
    resposta:
      "A aceleração de um objeto em um plano inclinado com atrito é dada por: a = g·sen(θ) - μ·g·cos(θ), onde g é a aceleração da gravidade, θ é o ângulo de inclinação do plano, e μ é o coeficiente de atrito."
  },
  {
    pergunta: "Qual é a vantagem mecânica de um plano inclinado?",
    resposta:
      "A vantagem mecânica de um plano inclinado é a razão entre o comprimento do plano (L) e a altura (h): VM = L/h. Isso significa que a força necessária para mover um objeto para cima no plano é reduzida por esse fator em comparação com levantá-lo verticalmente."
  }
];

const SalaDeAulaTesteSupabase: React.FC = () => {
  const router = useRouter();
  const { id: salaId } = useParams();

  const [sala, setSala] = useState<Sala | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loadingSala, setLoadingSala] = useState(true);
  const [errorSala, setErrorSala] = useState<string | null>(null);
  const [loadingQuestoes, setLoadingQuestoes] = useState(true);
  const [errorQuestoes, setErrorQuestoes] = useState<string | null>(null);
  const database = getDatabase(app);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeRunning, setIsTimeRunning] = useState(false);
  const [showModalFinal, setShowModalFinal] = useState(false);
  const [showResolucaoGeral, setShowResolucaoGeral] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [questaoId: string]: string }>({});
  const [isRevising, setIsRevising] = useState(false);
  const [showGalileuFAQs, setShowGalileuFAQs] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questoes[currentQuestionIndex];

  useEffect(() => {
    if (salaId) {
      fetchSala(salaId);
    } else {
      setErrorSala("ID da sala não encontrado na URL.");
      setLoadingSala(false);
    }
  }, [salaId]);

  useEffect(() => {
    if (sala?.questoes_firebase_ids && sala.created_by_user_id) {
      fetchQuestoesFromFirebase(sala.created_by_user_id, sala.questoes_firebase_ids);
    }
  }, [sala]);
  

  useEffect(() => {
    if (currentQuestion?.tempo && !isRevising && !quizFinished) {
      setTimeRemaining(currentQuestion.tempo);
    } else {
      setTimeRemaining(null);
    }
    setIsTimeRunning(!isRevising && !quizFinished);
    setSelectedAnswer(userAnswers[currentQuestion?.id] || null);
  }, [currentQuestionIndex, currentQuestion?.tempo, userAnswers, isRevising, quizFinished]);

  useEffect(() => {
    if (isTimeRunning && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && isTimeRunning) {
      setIsTimeRunning(false);
      goToNextQuestion();
    }
  }, [isTimeRunning, timeRemaining]);

  const fetchSala = async (id: string) => {
    setLoadingSala(true);
    setErrorSala(null);
    try {
      const { data, error } = await supabase
        .from("salas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorSala("Erro ao carregar os detalhes da sala.");
      } else if (data) {
        setSala(data as Sala);
      } else {
        setErrorSala("Sala não encontrada.");
      }
    } catch {
      setErrorSala("Erro inesperado ao carregar a sala.");
    } finally {
      setLoadingSala(false);
    }
  };

  const fetchQuestoesFromFirebase = async (userId: string, questaoIds: string[]) => {
    setLoadingQuestoes(true);
    setErrorQuestoes(null);
    if (!userId || !questaoIds || questaoIds.length === 0) {
      setQuestoes([]);
      setLoadingQuestoes(false);
      return;
    }
    try {
      const fetchedQuestoes: Questao[] = [];
      // Buscar questões da primeira referência
      for (const questaoId of questaoIds) {
        const questaoRef = ref(database, `questoes/${userId}/${questaoId}`);
        const snapshot = await get(questaoRef);
        if (snapshot.exists()) {
          fetchedQuestoes.push({ id: questaoId, ...snapshot.val() });
        }
      }
      // Buscar questões da segunda referência
      for (const questaoId of questaoIds) {
        const questaoComBaseNosSensoresRef = ref(database, `questoesComBaseNosSensores/${userId}/${questaoId}`);
        const snapshot = await get(questaoComBaseNosSensoresRef);
        if (snapshot.exists()) {
          fetchedQuestoes.push({ id: questaoId, ...snapshot.val() });
        }
      }
      setQuestoes(fetchedQuestoes);
    } catch {
      setErrorQuestoes("Erro ao carregar as questões.");
    } finally {
      setLoadingQuestoes(false);
    }
  };
  const goToNextQuestion = () => {
    if (currentQuestion?.id && selectedAnswer) {
      setUserAnswers(prevAnswers => ({ ...prevAnswers, [currentQuestion.id]: selectedAnswer }));
    }
    setSelectedAnswer(null);
    if (currentQuestionIndex < questoes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowModalFinal(true);
      setQuizFinished(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleToggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleVerResolucao = () => {
    setShowModalFinal(false);
    setShowResolucaoGeral(true);
  };


  const handleReverQuestoes = () => {
    setShowModalFinal(false);
    setIsRevising(true);
    setTimeRemaining(null);
    setIsTimeRunning(false);
    setQuizFinished(false);
  };

  const closeModalResolucao = () => {
    setShowResolucaoGeral(false);
  };

  const handleFinalizarRevisao = () => {
    setIsRevising(false);
    setShowModalFinal(true);
  };

  const toggleGalileuFAQs = () => {
    setShowGalileuFAQs(!showGalileuFAQs);
  };

  if (loadingSala) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando detalhes da sala...</div>;
  }

  if (errorSala) {
    return <div className="h-screen flex items-center justify-center text-red-500 text-xl">{errorSala}</div>;
  }

  if (loadingQuestoes) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando questões...</div>;
  }

  if (errorQuestoes) {
    return <div className="h-screen flex items-center justify-center text-red-500 text-xl">{errorQuestoes}</div>;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <Image
        src="/images/markim-Photoroom.png"
        alt="Logo Projeto Galileu"
        width={150}
        height={50}
        className="fixed top-4 left-4 z-20 hover:scale-105 transition-transform duration-300"
      />
      <div className="hidden md:block fixed left-0 bottom-24 z-10">
        <Image
          src="/images/galileuimagem.png"
          alt="Galileu"
          width={200}
          height={200}
          className="object-contain"
        />
        <button
          onClick={toggleGalileuFAQs}
          className="mt-2 ml-5 bg-purple-950 text-white border border-purple-950 rounded-full py-2 px-4 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Pergunte ao Galileu
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 flex justify-end">
        <div className="w-full lg:w-4/5 bg-purple-950 p-8 rounded-lg shadow-lg border border-purple-300 text-white">
          <header className="flex items-center justify-end mb-8">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-purple-300 transition duration-300"
            >
              Voltar
            </button>
          </header>
          <h1 className="text-2xl">Sala: {sala?.nome}</h1>
          {questoes.length > 0 && currentQuestion ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Questão {currentQuestionIndex + 1}:</h2>
              <div className="bg-purple-800 p-6 rounded-md border border-purple-400" key={currentQuestion.id}>
                <h3 className="font-semibold">{currentQuestion.enunciado}</h3>
                {currentQuestion.anexo && (
                  <div className="mt-2">
                    <Image
                      src={currentQuestion.anexo}
                      alt={`Anexo da questão ${currentQuestionIndex + 1}`}
                      width={300}
                      height={200}
                      className="object-contain rounded-md"
                    />
                  </div>
                )}
                <ul className="list-none pl-0 mt-3">
                  {Object.entries(currentQuestion.alternativas).map(([letra, texto]) => (
                    <li key={letra} className="mb-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-purple-600"
                          value={letra}
                          checked={selectedAnswer === letra}
                          onChange={() => handleAnswerSelect(letra)}
                          disabled={isRevising}
                        />
                        <span className="ml-2">{letra}: {texto}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {!isRevising && !quizFinished && currentQuestion.tempo && (
                  <p className="text-lg text-yellow-300 font-bold mt-3">
                    Tempo restante: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
              <div className="flex justify-between mt-4">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={isRevising ? undefined : () => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={isRevising}
                    className={`bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isRevising ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Anterior
                  </button>
                )}
                <button
                  onClick={isRevising ? handleFinalizarRevisao : goToNextQuestion}
                  className={`bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${!selectedAnswer && !isRevising ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!selectedAnswer && !isRevising}
                >
                  {isRevising ? 'Finalizar Revisão' : currentQuestionIndex < questoes.length - 1 ? 'Próxima' : 'Finalizar'}
                </button>
              </div>
            </div>
          ) : (
            <p>Nenhuma questão encontrada para esta sala.</p>
          )}
        </div>
      </div>

      {showGalileuFAQs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 p-6 rounded-lg shadow-lg border border-purple-300 text-white max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Dúvidas Frequentes sobre Plano Inclinado</h2>
              <button onClick={toggleGalileuFAQs} className="text-gray-400 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {planoInclinadoFAQs.map((faq, index) => (
                <div key={index} className="border border-purple-400 rounded-md overflow-hidden">
                  <button className="w-full text-left p-3 bg-purple-800 hover:bg-purple-700 focus:outline-none flex justify-between items-center" onClick={() => handleToggleFAQ(index)}>
                    <span className="font-medium">{faq.pergunta}</span>
                    <svg className={`h-5 w-5 transition-transform ${expandedFAQ === index ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === index && (
                    <div className="p-3 bg-purple-700">
                      <p className="whitespace-pre-line">{faq.resposta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

{showModalFinal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-purple-900 p-8 rounded-lg shadow-lg border border-purple-300 text-white relative max-w-md w-full">
      {/* Botão de fechar */}
      <button onClick={() => setShowModalFinal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-100">
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M15.78 14.36a1 1 0 01-1.42 1.42L12 13.41l-2.36 2.37a1 1 0 01-1.42-1.42L10.59 12l-2.37-2.36a1 1 0 111.42-1.42L12 10.59l2.36-2.37a1 1 0 111.42 1.42L13.41 12l2.37 2.36z" clipRule="evenodd" />
        </svg>
      </button>
      
      <h2 className="text-xl font-bold mb-4">Fim das Questões!</h2>
      <p className="mb-4">O que você gostaria de fazer?</p>
      <div className="flex flex-col space-y-2">
        <button onClick={handleVerResolucao} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Ver Resolução de Todas as Questões
        </button>
        <button  onClick={() => router.push('/analisegeraltesteum')} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Ver Análise Geral
        </button>
        {!isRevising && (
          <button onClick={handleReverQuestoes} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Rever Questões
          </button>
        )}
      </div>
    </div>
  </div>
)}


      {showResolucaoGeral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 p-8 rounded-lg shadow-lg border border-purple-400 text-white relative max-h-[80vh] w-[90%] max-w-4xl">
            <button onClick={closeModalResolucao} className="absolute top-2 right-2 text-gray-400 hover:text-gray-100">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M15.78 14.36a1 1 0 01-1.42 1.42L12 13.41l-2.36 2.37a1 1 0 01-1.42-1.42L10.59 12l-2.37-2.36a1 1 0 111.42-1.42L12 10.59l2.36-2.37a1 1 0 111.42 1.42L13.41 12l2.37 2.36z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Resoluções das Questões</h2>
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
              {questoes.map((questao, index) => (
                <div key={questao.id} className="p-4 border border-purple-400 rounded-md">
                  <h3 className="text-lg font-semibold">Questão {index + 1}:</h3>
                  <p className="mb-2">{questao.enunciado}</p>
                  {questao.anexo && (
                    <div className="mt-2 mb-3">
                      <Image
                        src={questao.anexo}
                        alt={`Anexo da questão ${index + 1}`}
                        width={300}
                        height={200}
                        className="object-contain rounded-md"
                      />
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-purple-700 rounded-md">
                    <h4 className="font-medium text-yellow-300">Resolução:</h4>
                    <p className="whitespace-pre-line">{questao.resolucao || "Resolução não disponível."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isRevising && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 p-8 rounded-lg shadow-lg border border-purple-400 text-white relative max-h-[80vh] w-[90%] max-w-4xl">
            <h2 className="text-xl font-bold mb-4">Revisão de Questões</h2>
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
              {questoes.map((questao, index) => {
                const userAnswer = userAnswers[questao.id];
                const isCorrect = userAnswer === questao.alternativa_correta;
                return (
                  <div key={questao.id} className={`p-4 border rounded-md ${isCorrect ? " bg-purple-900" : " bg-purple-900"}`}>
                    <h3 className="text-lg font-semibold">Questão {index + 1}:</h3>
                    <p className="whitespace-pre-line">{questao.enunciado}</p>
                    {questao.anexo && (
                      <div className="mt-2">
                        <Image src={questao.anexo} alt={`Anexo da questão ${index + 1}`} width={300} height={200} className="object-contain rounded-md" />
                      </div>
                    )}
                    {questao.alternativas && (
                      <ul className="list-none pl-0 mt-3">
                        {Object.entries(questao.alternativas).map(([letra, texto]) => {
                          const isUserAnswer = userAnswer === letra;
                          const isCorrectAnswer = questao.alternativa_correta === letra;
                          return (
                            <li key={letra} className="mb-2">
                              <label className="inline-flex items-center">
                                <input type="radio" className="form-radio h-5 w-5 text-purple-600" value={letra} checked={isUserAnswer} disabled />
                                <span className={`ml-2 ${isUserAnswer && isCorrectAnswer ? "text-green-400" : isUserAnswer && !isCorrectAnswer ? "text-red-400" : ""}`}>
                                  {letra}: {texto}
                                </span>
                                {isUserAnswer && isCorrectAnswer && <span className="ml-2 text-green-400">✓</span>}
                                {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-red-400">✗</span>}
                                {isCorrectAnswer && !isUserAnswer && <span className="ml-2 text-yellow-400">(Correta)</span>}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {questao.resolucao && (
                      <div className="mt-3 p-3 bg-purple-700 rounded-md">
                        <h4 className="font-medium text-yellow-300">Resolução:</h4>
                        <p className="whitespace-pre-line text-white">{questao.resolucao}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleFinalizarRevisao} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Finalizar Revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaDeAulaTesteSupabase;
