"use client";
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { app } from '../../../lib/firebaseConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CriarQuestaoDispositivo = () => {
  const [sensor, setSensor] = useState<any>(null);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [mostrarModalTempo, setMostrarModalTempo] = useState(false);
  const [enunciado, setEnunciado] = useState('');
  const [resolucao, setResolucao] = useState('');
  const [incognita, setIncognita] = useState('');
  const [alternativas, setAlternativas] = useState<{ [key: string]: string }>({
    A: '', B: '', C: '', D: '', E: '',
  });
  const [respostaCorreta, setRespostaCorreta] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const tempoTotal = Math.max(0, tempoMinutos * 60 + tempoSegundos);

  useEffect(() => {
    const db = getDatabase(app);
    const sensorRef = ref(db, 'sensor');

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setUserId(user.uid);
      setLoading(false);
    } else {
      router.push("/login");
    }

    onValue(sensorRef, (snapshot) => {
      const dados = snapshot.val();
      if (dados) setSensor(dados);
    });
  }, [router]);

  const criarQuestao = () => {
    if (!sensor) {
      alert('Sensor não encontrado!');
      return;
    }

    const novaQuestao = {
      enunciado,
      tempo: tempoTotal,
      resolucao,
      criadoEm: new Date().toISOString(),
      professor: userName,
      dados_usados: {
        aceleracao: sensor.aceleracao,
        distancia: sensor.distancia,
        angulo: sensor.angulo,
        tempo: sensor.tempo,
      },
      incognita,
      alternativas,
      respostaCorreta,
    };

    const db = getDatabase(app);
    const questoesRef = ref(db, `questoesComBaseNosSensores/${userId}`);
    push(questoesRef, novaQuestao).then(() => {
      alert('Questão criada com sucesso!');
      setEnunciado('');
      setTempoMinutos(0);
      setTempoSegundos(0);
      setResolucao('');
      setIncognita('');
      setAlternativas({ A: '', B: '', C: '', D: '', E: '' });
      setRespostaCorreta('');
    });
  };

  const atualizarAlternativa = (letra: string, value: string) => {
    setAlternativas((prev) => ({ ...prev, [letra]: value }));
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Galileu + botão de ajuda */}
      <div className="hidden md:flex flex-col items-center fixed left-0 bottom-0 z-10 ml-4 mb-4 gap-4">
        <Image src="/images/galileufrente.png" alt="Galileu" width={200} height={300} />
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Tipo / Exemplo
        </button>
      </div>

      {/* Modal de ajuda */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Tipo e Exemplo de Uso</h2>
            <p className="text-gray-700">Conteúdo a ser definido...</p>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <Image src="/images/markim-Photoroom.png" alt="Logo" width={150} height={50} />
          <nav>
            <ul className="flex flex-wrap justify-center gap-6">
              <li><button onClick={() => router.push('/dashboardprof')} className="text-white hover:text-purple-300 px-6 py-3">Início</button></li>
              <li><button onClick={() => router.push('/simuproftestesupabase')} className="text-white font-bold rounded-lg shadow-lg border border-purple-400 px-6 py-3">Simulações</button></li>
              <li><button onClick={() => router.push('/editarperfilprof')} className="bg-purple-600 text-white px-8 py-3 font-bold rounded-md">{userName}</button></li>
            </ul>
          </nav>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Dados do sensor */}
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-4">Dados do Sensor</h3>
            {sensor ? (
              <div className="grid grid-cols-2 gap-6">
                {['aceleracao', 'distancia', 'angulo', 'tempo'].map((key) => (
                  <div key={key} className="bg-white p-4 rounded-lg shadow-lg">
                    <h4 className="font-semibold text-lg">{key.charAt(0).toUpperCase() + key.slice(1)}:</h4>
                    <p>{sensor[key]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Carregando dados do sensor...</p>
            )}
          </div>

          {/* Formulário */}
          <div className="flex-1 bg-purple-900 rounded-lg shadow-lg border border-purple-300 py-8 px-4">
            <h2 className="text-2xl font-semibold mb-4 text-white">Criar Questão (Com Base no Sensor)</h2>

            <label className="block text-white font-semibold">Enunciado:</label>
            <input value={enunciado} onChange={(e) => setEnunciado(e.target.value)} className="w-full p-2 mb-4 rounded text-black" />

            <label className="block text-white font-semibold">Resolução:</label>
            <input value={resolucao} onChange={(e) => setResolucao(e.target.value)} className="w-full p-2 mb-4 rounded text-black" />

            <label className="block text-white font-semibold">Incógnita:</label>
            <select value={incognita} onChange={(e) => setIncognita(e.target.value)} className="w-full p-2 mb-4 rounded text-black">
              <option value="">Selecione uma incógnita</option>
              <option value="velocidade">Velocidade</option>
              <option value="px">Px</option>
              <option value="py">Py</option>
              <option value="força normal">Força Normal</option>
              <option value="força de atrito">Força de Atrito</option>
              <option value="aceleração">Aceleração</option>
            </select>

            <label className="block text-white font-semibold">Alternativas:</label>
            {['A', 'B', 'C', 'D', 'E'].map((letra) => (
              <div key={letra} className="flex items-center mb-2">
                <span className="w-6 text-white font-bold">{letra})</span>
                <input
                  type="text"
                  value={alternativas[letra]}
                  onChange={(e) => atualizarAlternativa(letra, e.target.value)}
                  className="w-full p-2 rounded text-black"
                />
              </div>
            ))}

            <label className="block text-white font-semibold mt-4">Resposta Correta (A-E):</label>
            <input
              type="text"
              maxLength={1}
              value={respostaCorreta}
              onChange={(e) => setRespostaCorreta(e.target.value.toUpperCase())}
              className="w-full p-2 mb-4 rounded text-black"
            />

            <label className="block mb-2 text-white">Tempo</label>
            <div>
            <button onClick={() => setMostrarModalTempo(true)} className="bg-purple-600 text-white py-2 px-4 rounded mb-4">
              Definir Tempo
            </button>
            </div>
            <button onClick={criarQuestao} className="bg-green-500 text-white py-2 px-6 rounded font-bold">
              Criar Questão
            </button>
          </div>
          
        </div>
      </div>

      {/* Modal de tempo */}
      {mostrarModalTempo && (
        <div className="modal bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <div className="bg-purple-900 border border-purple-200 p-8 rounded-md">
            <h3 className="text-xl font-bold mb-4 text-white">Definir Tempo</h3>
            <div className="flex gap-6 mb-4">
              <div>
                <label htmlFor="minutos" className="text-white block">Minutos</label>
                <input
                  id="minutos"
                  type="number"
                  min="0"
                  value={tempoMinutos}
                  onChange={(e) => setTempoMinutos(Math.max(0, +e.target.value))}
                  className="p-2 border rounded text-black w-20"
                />
              </div>
              <div>
                <label htmlFor="segundos" className="text-white block">Segundos</label>
                <input
                  id="segundos"
                  type="number"
                  min="0"
                  max="59"
                  value={tempoSegundos}
                  onChange={(e) => setTempoSegundos(Math.max(0, Math.min(59, +e.target.value)))}
                  className="p-2 border rounded text-black w-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setMostrarModalTempo(false)}>
                Cancelar
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setMostrarModalTempo(false)}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriarQuestaoDispositivo;
