"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDatabase, ref, onValue, set, push, update } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import ForcasSVG from "@/components/ForcasSVG";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const InfoCard = ({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | null;
  unit: string;
}) => (
  <div className="p-6 bg-white rounded-lg shadow-lg text-center">
    <h4 className="text-xl font-semibold text-black">{title}</h4>
    <p className="text-2xl font-bold text-black">
      {value !== null ? `${value.toFixed(2)} ${unit}` : "Carregando..."}
    </p>
  </div>
);

const ExplicacaoGalileu: React.FC<{
  angulo: number | null;
  forcaPeso: number | null;
  forcaNormal: number | null;
  forcaAtrito: number | null;
  aceleracao: number | null;
}> = ({ angulo, forcaPeso, forcaNormal, forcaAtrito, aceleracao }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-8">
      <h3 className="text-lg font-bold mb-4 text-black">Explicação das Forças</h3>
      <div className="space-y-4 text-black">
        <p>
          <strong className="text-green-600">Força Normal (N):</strong> A força normal é a força que a superfície exerce sobre o bloco. Ela é sempre perpendicular à superfície de contato. Em um plano inclinado, ela é dada por <code>Fₙ = m × g × cos(θ)</code>.
        </p>
        <p>
          <strong className="text-red-600">Força Peso (P):</strong> A força peso é a força com a qual a gravidade atrai o objeto para baixo. Ela pode ser calculada pela fórmula <code>Fₚ = m × g</code>.
        </p>
        <p>
          <strong className="text-orange-500">Força de Atrito (Fₐ):</strong> O atrito é a força que resiste ao movimento do bloco. Sua intensidade é dada por <code>Fₐ = μ × Fₙ</code>.
        </p>
        <p>
          <strong>Aceleração (a):</strong> A aceleração do bloco é a taxa de variação da velocidade do objeto. Ela pode ser calculada pela segunda lei de Newton, <code>F = m × a</code>.
        </p>
        <p>
          <strong className="text-blue-600">Força Resultante (Fᵣ):</strong> A força resultante é a soma vetorial de todas as forças atuando sobre o bloco. No plano inclinado, ela é responsável pelo movimento do bloco ao longo da rampa e é calculada pela componente do peso paralela ao plano subtraída da força de atrito: <code>Fᵣ = m × g × sen(θ) - Fₐ</code>. Essa força determina a aceleração do bloco pela equação <code>Fᵣ = m × a</code>.
        </p>
      </div>
    </div>
  );
};

const AnaliseSimulacao: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulacaoId, setSimulacaoId] = useState<string | null>(null);
  
  // Valores vindos do Firebase
  const [distancia, setDistancia] = useState<number | null>(null);
  const [angulo, setAngulo] = useState<number | null>(null);
  const [velocidade, setVelocidade] = useState<number | null>(null);
  const [px, setPx] = useState<number | null>(null);
  const [py, setPy] = useState<number | null>(null);
  const [aceleracao, setAceleracao] = useState<number | null>(null);
  const [forcaPeso, setForcaPeso] = useState<number | null>(null);
  const [forcaNormal, setForcaNormal] = useState<number | null>(null);
  const [forcaAtrito, setForcaAtrito] = useState<number | null>(null);
  const [forcaResultante, setForcaResultante] = useState<number | null>(null);
  
  // Dados para o gráfico
  const [dadosGrafico, setDadosGrafico] = useState<Array<{angulo: number, aceleracao: number}>>([]);

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

  // Efeito para atualizar dados da simulação no Firebase
  useEffect(() => {
    if (!simulationStarted || !simulacaoId) return;

    const database = getDatabase(app);
    const simulacaoDadosRef = ref(database, `simulacoes/${simulacaoId}/dados`);

    // Atualizar dados da simulação quando mudarem
    const updateSimulationData = () => {
      set(simulacaoDadosRef, {
        distancia,
        angulo,
        velocidade,
        px,
        py,
        aceleracao,
        forcaPeso,
        forcaNormal,
        forcaAtrito,
        forcaResultante
      }).catch((error) => {
        console.error("Erro ao atualizar dados da simulação:", error);
      });
    };

    // Só atualiza se todos os valores importantes estiverem disponíveis
    if (distancia !== null && angulo !== null && velocidade !== null) {
      updateSimulationData();
    }

    // Configurar intervalo para atualização periódica
    const interval = setInterval(updateSimulationData, 5000);
    
    return () => clearInterval(interval);
  }, [
    simulationStarted, 
    simulacaoId, 
    distancia, 
    angulo, 
    velocidade, 
    px, 
    py, 
    aceleracao, 
    forcaPeso, 
    forcaNormal, 
    forcaAtrito, 
    forcaResultante
  ]);

  useEffect(() => {
    if (!simulationStarted) return;

    const database = getDatabase(app);

    // Obter todos os valores do Firebase
    const distRef = ref(database, "sensor/distancia");
    const angRef = ref(database, "sensor/angulo");
    const velRef = ref(database, "sensor/velocidade");
    const pxRef = ref(database, "sensor/px");
    const pyRef = ref(database, "sensor/py");
    const accRef = ref(database, "sensor/aceleracao");
    const pesoRef = ref(database, "sensor/peso");
    const normalRef = ref(database, "sensor/normal");
    const atritoRef = ref(database, "sensor/atrito");
    const resultanteRef = ref(database, "sensor/resultante");
    const graficoRef = ref(database, "sensor/dadosGrafico");

    const unsub1 = onValue(distRef, (snap) => {
      if (snap.exists()) {
        setDistancia(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub2 = onValue(angRef, (snap) => {
      if (snap.exists()) {
        setAngulo(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub3 = onValue(velRef, (snap) => {
      if (snap.exists()) {
        setVelocidade(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub4 = onValue(pxRef, (snap) => {
      if (snap.exists()) {
        setPx(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub5 = onValue(pyRef, (snap) => {
      if (snap.exists()) {
        setPy(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub6 = onValue(accRef, (snap) => {
      if (snap.exists()) {
        setAceleracao(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub7 = onValue(pesoRef, (snap) => {
      if (snap.exists()) {
        setForcaPeso(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub8 = onValue(normalRef, (snap) => {
      if (snap.exists()) {
        setForcaNormal(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub9 = onValue(atritoRef, (snap) => {
      if (snap.exists()) {
        setForcaAtrito(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub10 = onValue(resultanteRef, (snap) => {
      if (snap.exists()) {
        setForcaResultante(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub11 = onValue(graficoRef, (snap) => {
      if (snap.exists()) {
        const graficoData = snap.val();
        if (Array.isArray(graficoData)) {
          setDadosGrafico(graficoData);
          
          // Atualizar gráfico na simulação no Firebase
          if (simulacaoId) {
            const graficoSimulacaoRef = ref(database, `simulacoes/${simulacaoId}/grafico`);
            set(graficoSimulacaoRef, graficoData).catch((error) => {
              console.error("Erro ao atualizar gráfico na simulação:", error);
            });
          }
        } else {
          console.error("Dados do gráfico não estão em formato de array");
        }
      }
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
      unsub7();
      unsub8();
      unsub9();
      unsub10();
      unsub11();
    };
  }, [simulationStarted, simulacaoId]);

  // Função para gerar dados para o gráfico caso não existam
  const gerarDadosGrafico = () => {
    const database = getDatabase(app);
    const graficoRef = ref(database, "sensor/dadosGrafico");
    
    // Gerar dados teóricos de simulação - aceleração aumenta com o ângulo
    const dadosGerados = Array.from({length: 91}, (_, i) => ({
      angulo: i,
      aceleracao: i > 0 ? parseFloat((Math.sin(i * Math.PI / 180) * 9.8).toFixed(2)) : 0
    }));
    
    set(graficoRef, dadosGerados).catch(error => {
      console.error("Erro ao gerar dados do gráfico:", error);
    });
  };

  const iniciarSimulacao = () => {
    if (simulationStarted) {
      console.warn("A simulação já está em andamento.");
      return; // Não permite iniciar uma nova simulação se já estiver em andamento
    }

    const database = getDatabase(app);
    
    // Criar um novo nó para a simulação usando push() para gerar um ID único
    const simulacoesRef = ref(database, "simulacoes");
    const novaSimulacaoRef = push(simulacoesRef);
    const novoSimulacaoId = novaSimulacaoRef.key;
    
    // Timestamp fixo no momento da criação
    const timestampInicio = new Date().toISOString();
    
    // Atualizar o valor "liberar" para true
    const liberarRef = ref(database, "sensor/liberar");
    
    // Primeiro, criar a simulação
    set(novaSimulacaoRef, {
      userName,
      timestamp: timestampInicio,
      status: "iniciada",
      dados: {
        distancia: 0,
        angulo: 0,
        velocidade: 0,
        px: 0,
        py: 0,
        aceleracao: 0,
        forcaPeso: 0,
        forcaNormal: 0,
        forcaAtrito: 0,
        forcaResultante: 0
      }
    })
      .then(() => {
        // Depois, alterar o valor de liberar para true
        return set(liberarRef, true);
      })
      .then(() => {
        setSimulacaoId(novoSimulacaoId);
        setSimulationStarted(true);
        
        // Gerar dados para o gráfico se não existirem
        const graficoRef = ref(database, "sensor/dadosGrafico");
        onValue(graficoRef, (snap) => {
          if (!snap.exists() || !Array.isArray(snap.val()) || snap.val().length === 0) {
            gerarDadosGrafico();
          }
        }, { onlyOnce: true });
      })
      .catch((error) => {
        console.error("Erro ao iniciar simulação:", error);
      });
  };

  const finalizarSimulacao = () => {
    if (!simulationStarted || !simulacaoId) {
      console.warn("Nenhuma simulação em andamento para finalizar.");
      return;
    }

    const database = getDatabase(app);
    const liberarRef = ref(database, "sensor/liberar");
    const simulacaoRef = ref(database, `simulacoes/${simulacaoId}`);

    // Definir liberar como false e atualizar o status da simulação como 'finalizada'
    set(liberarRef, false)
      .then(() => {
        // Atualizar status da simulação usando update para manter dados existentes
        return update(simulacaoRef, { status: "finalizada" });
      })
      .then(() => {
        setSimulationStarted(false);
        setSimulacaoId(null); // Limpa o ID da simulação
      })
      .catch((error) => {
        console.error("Erro ao finalizar simulação:", error);
      });
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
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <Image
            onClick={() => router.push("/dashboardaluno")}
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={150}
            height={50}
            className="hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
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

        <div className="relative max-w-5xl mx-auto bg-purple-200 bg-opacity-20 p-8 rounded-xl mt-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Análise</h2>

          {!simulationStarted ? (
            <div className="flex justify-center space-x-4">
              <button
                onClick={iniciarSimulacao}
                className="bg-purple-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-purple-600 transition duration-300 shadow-lg"
              >
                Iniciar Simulação
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center space-x-4 mb-10">
                <button
                  onClick={finalizarSimulacao}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-500 transition duration-300 shadow-lg"
                >
                  Fim da Simulação
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-black mb-14">
                <InfoCard title="Distância" value={distancia} unit="m" />
                <InfoCard title="Ângulo" value={angulo} unit="°" />
                <InfoCard title="Velocidade" value={velocidade} unit="m/s" />
                <InfoCard title="Px / Py" value={px !== null && py !== null ? px + py : null} unit="N" />
                <InfoCard title="Força Peso" value={forcaPeso} unit="N" />
                <InfoCard title="Força Normal" value={forcaNormal} unit="N" />
                <InfoCard title="Força Atrito" value={forcaAtrito} unit="N" />
                <InfoCard title="Aceleração" value={aceleracao} unit="m/s²" />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg mb-12">
                <h3 className="text-xl font-semibold text-black mb-4">Representação das Forças</h3>
                <div className="flex justify-center items-center h-96">
                  <ForcasSVG
                    forcaPeso={forcaPeso ?? 0}
                    forcaNormal={forcaNormal ?? 0}
                    forcaAtrito={forcaAtrito ?? 0}
                    px={px ?? 0}
                    py={py ?? 0}
                    forcaResultante={forcaResultante ?? 0}
                  />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg mb-8 mt-2">
                <ExplicacaoGalileu
                  angulo={angulo}
                  forcaPeso={forcaPeso}
                  forcaNormal={forcaNormal}
                  forcaAtrito={forcaAtrito}
                  aceleracao={aceleracao}
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-black mb-4">
                  Gráfico: Aceleração vs Ângulo
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={dadosGrafico.length > 0 ? dadosGrafico : Array.from({length: 91}, (_, i) => ({angulo: i, aceleracao: 0}))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="angulo" 
                      label={{ value: "Ângulo (°)", position: "insideBottomRight", offset: 0 }}
                      domain={[0, 90]}
                      ticks={[0, 15, 30, 45, 60, 75, 90]}
                    />
                    <YAxis 
                      label={{ value: "Aceleração (m/s²)", angle: -90, position: "insideLeft" }}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} m/s²`, "Aceleração"]}
                      labelFormatter={(label) => `Ângulo: ${label}°`}
                    />
                    <Line
                      type="monotone"
                      dataKey="aceleracao"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnaliseSimulacao;
