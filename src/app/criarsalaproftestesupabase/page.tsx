"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Questao {
  id: string;
  enunciado: string;
}

const gerarCodigoSala = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const CriarSalaSupabaseFirebase = () => {
  const router = useRouter();
  const database = getDatabase(app);
  const [nomeSala, setNomeSala] = useState("");
  const [questoesFirebase, setQuestoesFirebase] = useState<Questao[]>([]);
  const [questoesSensores, setQuestoesSensores] = useState<Questao[]>([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>([]);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);
  const [errorFirebase, setErrorFirebase] = useState<string | null>(null);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [codigoSala, setCodigoSala] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [salaId, setSalaId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.uid);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const buscarQuestoes = async () => {
      if (!userId) return;
      setIsLoadingFirebase(true);
      setErrorFirebase(null);
      try {
        // Questões normais
        const refNormais = ref(database, `questoes/${userId}`);
        const snapNormais = await get(refNormais);
        const listaNormais: Questao[] = snapNormais.exists()
          ? Object.keys(snapNormais.val()).map((key) => ({
              id: key,
              enunciado: snapNormais.val()[key]?.enunciado || "Enunciado não disponível",
            }))
          : [];

        // Questões com sensores
        const refSensores = ref(database, `questoesComBaseNosSensores/${userId}`);
        const snapSensores = await get(refSensores);
        const listaSensores: Questao[] = snapSensores.exists()
          ? Object.keys(snapSensores.val()).map((key) => {
              const q = snapSensores.val()[key];
              return {
                id: key,
                enunciado: q?.enunciado || q?.descricao || q?.titulo || "Sem enunciado",
              };
            })
          : [];

        setQuestoesFirebase(listaNormais);
        setQuestoesSensores(listaSensores);
      } catch (error: any) {
        console.error("Erro ao buscar questões:", error);
        setErrorFirebase("Ocorreu um erro ao buscar as questões.");
      } finally {
        setIsLoadingFirebase(false);
      }
    };

    buscarQuestoes();
  }, [userId]);

  const handleQuestaoSelecionada = (questaoId: string) => {
    setQuestoesSelecionadas((prev) =>
      prev.includes(questaoId)
        ? prev.filter((id) => id !== questaoId)
        : [...prev, questaoId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoadingSupabase(true);
    setErrorSupabase(null);
    setSuccessMessage(null);
    setCodigoSala(null);

    if (!nomeSala.trim()) {
      setErrorSupabase("Por favor, insira um nome para a sala.");
      setIsLoadingSupabase(false);
      return;
    }

    const codigo = gerarCodigoSala();

    try {
      const { data, error } = await supabase
        .from("salas")
        .insert([
          {
            nome: nomeSala,
            codigo: codigo,
            questoes_firebase_ids: questoesSelecionadas,
            created_by_user_id: userId,
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao criar sala:", error);
        setErrorSupabase("Ocorreu um erro ao criar a sala.");
      } else if (data && data.length > 0) {
        setSuccessMessage(`Sala "${nomeSala}" criada com sucesso!`);
        setCodigoSala(codigo);
        setSalaId(data[0].id);
      } else {
        setErrorSupabase("Falha ao criar a sala.");
      }
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setErrorSupabase("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  const finalizarAula = async () => {
    if (!salaId) return;
    const { error } = await supabase
      .from("salas")
      .delete()
      .eq("id", salaId);

    if (error) {
      console.error("Erro ao finalizar aula:", error);
      setErrorSupabase("Erro ao finalizar a aula.");
    } else {
      setSuccessMessage("Aula finalizada e sala removida com sucesso.");
      setCodigoSala(null);
      setSalaId(null);
    }
  };

  if (isLoadingFirebase) return <div className="text-center mt-8">Carregando questões...</div>;
  if (errorFirebase) return <div className="text-red-500 text-center mt-8">{errorFirebase}</div>;

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
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image src="/images/galileufrente.png" alt="Galileu" width={300} height={300} className="object-contain" />
      </div>

      <div>
        <Image
          src="/images/markim-Photoroom.png"
          alt="Logo Projeto Galileu"
          width={150}
          height={50}
          onClick={() => router.push("/dashboardprof")}
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="min-h-screen justify-center">
        <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
          <div className="bg-purple-950 p-5 rounded-lg shadow-lg border border-purple-200 max-w-7xl w-full text-center relative">
            <button
              onClick={() => router.push("/simuproftestesupabase")}
              className="absolute top-4 left-4 text-white hover:text-purple-300 transition duration-300"
            >
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-2xl font-bold text-white text-center mb-6">Criar Nova Sala de Aula</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nomeSala" className="block text-white-700 text-sm font-bold mb-2">
                  Nome da Sala:
                </label>
                <input
                  type="text"
                  id="nomeSala"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                  value={nomeSala}
                  onChange={(e) => setNomeSala(e.target.value)}
                />
              </div>

              {/* Questões normais */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-white-700 mb-2">Questões Normais</h2>
                {questoesFirebase.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                    {questoesFirebase.map((questao) => (
                      <li
                        key={questao.id}
                        className={`bg-gray-100 text-black p-2 rounded-md shadow-sm cursor-pointer ${
                          questoesSelecionadas.includes(questao.id) ? "border-2 border-purple-500" : ""
                        }`}
                        onClick={() => handleQuestaoSelecionada(questao.id)}
                      >
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-black rounded focus:ring-purple-500 mr-2"
                            checked={questoesSelecionadas.includes(questao.id)}
                            onChange={() => handleQuestaoSelecionada(questao.id)}
                          />
                          <span>{questao.enunciado.substring(0, 100)}...</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white-500">Nenhuma questão encontrada.</p>
                )}
              </div>

              {/* Questões com sensores */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-white-700 mb-2">Questões com Base em Sensores</h2>
                {questoesSensores.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                    {questoesSensores.map((questao) => (
                      <li
                        key={questao.id}
                        className={`bg-gray-100 text-black p-2 rounded-md shadow-sm cursor-pointer ${
                          questoesSelecionadas.includes(questao.id) ? "border-2 border-green-500" : ""
                        }`}
                        onClick={() => handleQuestaoSelecionada(questao.id)}
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-black rounded focus:ring-green-500"
                            checked={questoesSelecionadas.includes(questao.id)}
                            onChange={() => handleQuestaoSelecionada(questao.id)}
                          />
                          <span>{questao.enunciado.substring(0, 100)}...</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white-500">Nenhuma questão com sensores encontrada.</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => router.back()}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Voltar
                </button>
                <button
                  className={`bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    isLoadingSupabase ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  type="submit"
                  disabled={isLoadingSupabase}
                >
                  {isLoadingSupabase ? "Criando..." : "Criar Sala"}
                </button>
              </div>

              {codigoSala && (
                <div className="mt-4">
                  <button
                    onClick={finalizarAula}
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Finalizar Aula
                  </button>
                </div>
              )}

              {errorSupabase && <div className="text-red-500 text-sm mt-2">{errorSupabase}</div>}
              {successMessage && (
                <div className="text-green-500 text-sm mt-2">
                  {successMessage}
                  {codigoSala && (
                    <div className="mt-2 text-white font-bold">
                      Código da Sala:{" "}
                      <span className="bg-purple-100 text-black px-2 py-1 rounded">{codigoSala}</span>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarSalaSupabaseFirebase;
