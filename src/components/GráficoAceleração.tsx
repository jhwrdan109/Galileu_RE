import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { onValue, ref } from "firebase/database";
import { database } from "../../lib/firebaseConfig"; // ajuste o caminho conforme sua estrutura

const GraficoAceleracao = () => {
  const [angulo, setAngulo] = useState(30); // Valor inicial até carregar do Firebase
  const [dadosGrafico, setDadosGrafico] = useState<{ angulo: number; aceleracao: number }[]>([]);

  const g = 9.8; // Aceleração gravitacional
  const mu = 0.3; // Coeficiente de atrito

  // Fórmula para calcular a aceleração
  const calcularAceleracao = (theta: number) => {
    const rad = (theta * Math.PI) / 180;
    return g * (Math.sin(rad) - mu * Math.cos(rad));
  };

  // Gerar os dados para o gráfico (ângulos de 0° a 90°)
  const gerarDados = () => {
    const dados = [];
    for (let anguloAtual = 0; anguloAtual <= 90; anguloAtual++) {
      dados.push({
        angulo: anguloAtual,
        aceleracao: calcularAceleracao(anguloAtual),
      });
    }
    setDadosGrafico(dados);
  };

  // Buscar o ângulo do Firebase
  useEffect(() => {
    const anguloRef = ref(database, "sensor/angulo"); // Caminho do Firebase
    const unsubscribe = onValue(anguloRef, (snapshot) => {
      const valor = snapshot.val();
      if (valor !== null) {
        setAngulo(parseFloat(valor));
      }
    });

    gerarDados(); // Gera os dados uma vez

    return () => unsubscribe(); // Limpar o listener
  }, []);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6 text-black">
        Gráfico de Aceleração vs. Ângulo
      </h2>

      {/* Exibe o ângulo atual vindo do Firebase */}
      <div className="flex justify-center items-center mb-6">
        <p className="text-lg text-black">
          Ângulo lido do sensor: <strong>{angulo.toFixed(1)}°</strong>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="angulo">
            <Label value="Ângulo (°)" offset={0} position="bottom" />
          </XAxis>
          <YAxis>
            <Label value="Aceleração (m/s²)" angle={-90} position="left" />
          </YAxis>

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
            labelFormatter={(value: number) => `Ângulo: ${value}°`}
            formatter={(value: number, name: string, props: any) => {
              return [`Aceleração: ${value.toFixed(2)} m/s²`, `Ângulo: ${props.payload.angulo}°`];
            }}
          />

          {/* Linha para aceleração = 0 */}
          <ReferenceLine y={0} label="Aceleração = 0" stroke="red" strokeDasharray="3 3" />

          {/* Linha do gráfico */}
          <Line
            type="monotone"
            dataKey="aceleracao"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
            isAnimationActive={true}
            animationDuration={1000}
          />

          {/* Linha destacando o ponto do ângulo atual */}
          <Line
            type="monotone"
            dataKey="aceleracao"
            stroke="#FF0000"
            dot={false} // Para não mostrar os pontos
            strokeDasharray="4 4"
            data={dadosGrafico.filter((d) => d.angulo === angulo)}
            isAnimationActive={false}
          />

          <Legend verticalAlign="top" height={36} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoAceleracao;
