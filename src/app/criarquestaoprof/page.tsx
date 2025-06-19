'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { database } from '../../../lib/firebaseConfig';
import { ref, set } from 'firebase/database';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Clock, XCircle } from 'lucide-react';

const CriarQuestao = () => {
  const [enunciado, setEnunciado] = useState('');
  const [resolucao, setResolucao] = useState('');
  const [alternativas, setAlternativas] = useState('');
  const [alternativasVisualizacao, setAlternativasVisualizacao] = useState(['', '', '', '', '']);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [anexo, setAnexo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModalTempo, setMostrarModalTempo] = useState(false);
  const [alternativaCorreta, setAlternativaCorreta] = useState('');
  const [erros, setErros] = useState({
    enunciado: '',
    resolucao: '',
    alternativas: '',
    incognita: '',
    alternativaCorreta: '',
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setUserId(user.uid);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Quando o componente é montado, se alternativas tiver valor, preenche o array de visualização
  useEffect(() => {
    if (alternativas) {
      const alts = alternativas.split(',').map(alt => alt.trim());
      const novasAlternativas = [...alternativasVisualizacao];
      
      for (let i = 0; i < Math.min(alts.length, 5); i++) {
        novasAlternativas[i] = alts[i];
      }
      
      setAlternativasVisualizacao(novasAlternativas);
    }
  }, []); // Executa apenas na montagem

  // Função para atualizar uma alternativa específica
  const atualizarAlternativa = (index, valor) => {
    const novasAlternativas = [...alternativasVisualizacao];
    novasAlternativas[index] = valor;
    setAlternativasVisualizacao(novasAlternativas);
    
    // Converte o array de visualização para a string de alternativas
    setAlternativas(novasAlternativas.join(', '));
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  const handleAnexoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnexo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAnexo(null);
    setImageUrl(null);
  };

  const handleSalvarQuestao = async () => {
    if (!userId) return;

    // Valida que todas as alternativas estão preenchidas
    const todasAlternativasPreenchidas = alternativasVisualizacao.every(alt => alt.trim() !== '');

    const novosErros = {
      enunciado: !enunciado.trim() ? 'O enunciado é obrigatório.' : '',
      resolucao: !resolucao.trim() ? 'A resolução é obrigatória.' : '',
      alternativas: !todasAlternativasPreenchidas ? 'Todas as alternativas são obrigatórias.' : '',
      alternativaCorreta: !alternativaCorreta ? 'A alternativa correta é obrigatória.' : '',
    };
    setErros(novosErros);

    if (Object.values(novosErros).some((erro) => erro !== '')) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const tempoTotal = Math.max(0, tempoMinutos * 60 + tempoSegundos); // Impede tempo negativo
    let anexoUrl = null;

    if (anexo) {
      try {
        const filePath = `questoes/${userId}/${Date.now()}-${anexo.name}`;
        const { data, error } = await supabase.storage
          .from('arquivos')
          .upload(filePath, anexo);

        if (error) return;

        const { data: publicUrlData } = supabase.storage
          .from('arquivos')
          .getPublicUrl(data.path);

        anexoUrl = publicUrlData?.publicUrl || null;
      } catch {
        return;
      }
    }

    const letras = ['A', 'B', 'C', 'D', 'E'];
    const alternativasObj = {};
    const alternativasArray = alternativas.split(',').map((alt) => alt.trim());
    for (let i = 0; i < letras.length; i++) {
      alternativasObj[letras[i]] = alternativasArray[i] || '';
    }

    const chaveQuestao = enunciado.trim().substring(0, 20).replace(/\s+/g, '_');

    const novaQuestao = {
      enunciado,
      resolucao,
      alternativas: alternativasObj,
      alternativaCorreta,
      criadoEm: new Date().toISOString(),
      professor: userName,
      professorId: userId,
      tempo: tempoTotal,
      anexo: anexoUrl,
    };

    try {
      const questaoRef = ref(database, `questoes/${userId}/${chaveQuestao}`);
      await set(questaoRef, novaQuestao);

      alert('Questão salva com sucesso!');
      setEnunciado('');
      setResolucao('');
      setAlternativas('');
      setAlternativasVisualizacao(['', '', '', '', '']);
      setTempoMinutos(0);
      setTempoSegundos(0);
      setAnexo(null);
      setImageUrl(null);
      setAlternativaCorreta('');

      // Redireciona para a página de escolha após salvar
      router.push("/escolhacriadasoucriarprof");
    } catch {
      alert('Erro ao salvar a questão.');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Imagem fixa na esquerda */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileufrente.png"
          alt="Galileu"
          width={200} // Ajuste o tamanho conforme necessário
          height={300}
          className="object-contain"
        />
      </div>
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
                  onClick={() => router.push('/dashboardprof')}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/quemsomosprof')}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
                >
                  Quem Somos
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/simuproftestesupabase')}
                  className="text-white px-6 py-3 rounded-md font-bold border border-purple-400"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/editarperfilprof')}
                  className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>
        </header>
        <div className="flex items-center justify-center h-full">
          <div className="bg-purple-950 ml-40 p-4 rounded-lg shadow-lg border border-purple-300 max-w-7xl w-full text-center relative">
            <button
              onClick={() => router.push("/escolhacriadasoucriarprof")}
              className="absolute top-4 left-4 text-white hover:text-purple-300 transition duration-300"
            >
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-2xl font-bold mb-6">Criar Questão</h1>

            <form>
              <div className="mb-4">
                <label className="block mb-2 text-white">Enunciado</label>
                <textarea
                  className={`w-full p-2 border rounded text-black ${erros.enunciado ? 'border-red-500' : ''}`}
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                />
                {erros.enunciado && <p className="text-red-500 text-sm">{erros.enunciado}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-white">Resolução</label>
                <textarea
                  className={`w-full p-2 border rounded text-black ${erros.resolucao ? 'border-red-500' : ''}`}
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                />
                {erros.resolucao && <p className="text-red-500 text-sm">{erros.resolucao}</p>}
              </div>
              
              {/* Interface melhorada para as alternativas */}
              <div className="mb-4">
                <label className="block text-lg font-semibold text-white">Alternativas (A até E):</label>
                {['A', 'B', 'C', 'D', 'E'].map((letra, i) => (
                  <div key={i} className="flex items-center mb-2">
                    <span className="w-6 font-bold text-white">{letra})</span>
                    <input
                      type="text"
                      value={alternativasVisualizacao[i]}
                      onChange={(e) => atualizarAlternativa(i, e.target.value)}
                      className={`w-full p-2 border rounded-md text-black ${erros.alternativas ? 'border-red-500' : ''}`}
                    />
                  </div>
                ))}
                {erros.alternativas && <p className="text-red-500 text-sm">{erros.alternativas}</p>}
              </div>
              
              <div className="mb-4">
              
                {erros.incognita && <p className="text-red-500 text-sm">{erros.incognita}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-white">Alternativa Correta</label>
                <select
                  value={alternativaCorreta}
                  onChange={(e) => setAlternativaCorreta(e.target.value)}
                  className={`w-full p-3 rounded-md text-black border border-gray-300 mb-4 ${erros.alternativaCorreta ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione a alternativa correta</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
                {erros.alternativaCorreta && <p className="text-red-500 text-sm">{erros.alternativaCorreta}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-white">Tempo</label>
                <button
                  type="button"
                  className="bg-purple-600 text-white py-2 px-4 rounded-md"
                  onClick={() => setMostrarModalTempo(true)}
                >
                  Definir Tempo
                </button>
                {mostrarModalTempo && (
                  <div className="modal bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="bg-purple-900 border border-purple-200 p-8 rounded-md">
                      <h3 className="text-xl font-bold mb-4">Tempo</h3>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center mr-4">
                          <label htmlFor="minutos" className="text-white mr-2">Minutos</label>
                          <input
                            id="minutos"
                            type="number"
                            min="0"
                            value={tempoMinutos}
                            onChange={(e) => setTempoMinutos(Math.max(0, +e.target.value))}
                            placeholder="Minutos"
                            className="p-2 border rounded text-black w-20"
                          />
                        </div>
                        <span className="text-white">:</span>
                        <div className="flex items-center ml-4">
                          <label htmlFor="segundos" className="text-white mr-2">Segundos</label>
                          <input
                            id="segundos"
                            type="number"
                            min="0"
                            max="59"
                            value={tempoSegundos}
                            onChange={(e) => setTempoSegundos(Math.max(0, Math.min(59, +e.target.value)))}
                            placeholder="Segundos"
                            className="p-2 border rounded text-black w-20"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          className="bg-red-500 text-white py-2 px-4 rounded-md mr-2"
                          onClick={() => setMostrarModalTempo(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          className="bg-green-500 text-white py-2 px-4 rounded-md"
                          onClick={() => setMostrarModalTempo(false)}
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-white">Anexo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="p-2 border rounded"
                  onChange={handleAnexoChange}
                />
                {imageUrl && (
                  <div className="mt-4 relative">
                    <Image
                      src={imageUrl}
                      alt="Imagem anexa"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 text-red-500"
                      onClick={handleRemoveImage}
                    >
                      <XCircle size={24} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="bg-green-500 text-white px-6 py-3 rounded-md"
                  onClick={handleSalvarQuestao}
                >
                  Salvar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarQuestao;