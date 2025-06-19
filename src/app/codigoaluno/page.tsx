"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../../../lib/supabase"; // Importe a instância do Supabase

const CodigoAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigoDigitado, setCodigoDigitado] = useState<string>("");
  const [codigoInvalido, setCodigoInvalido] = useState<boolean>(false);

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

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  const handleCodigoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length <= 6) {
      setCodigoDigitado(event.target.value.toUpperCase());
    }
  };

  const handleSubmitCodigo = async () => {
    if (codigoDigitado.length === 6) {
      try {
        const { data, error } = await supabase
          .from("salas")
          .select("id")
          .eq("codigo", codigoDigitado.toUpperCase())
          .single(); // Espera-se apenas um resultado com o código

        if (error) {
          console.error("Erro ao verificar código no Supabase:", error);
          setCodigoInvalido(true);
        } else if (data) {
          console.log("Código válido! Redirecionando para a sala com ID:", data.id);
          router.push(`/saladeaulatestesupabase/${data.id}`); // Redireciona para a sala, passando o ID
        } else {
          setCodigoInvalido(true);
          console.log("Código inválido!");
        }
      } catch (error) {
        console.error("Erro inesperado ao verificar código:", error);
        setCodigoInvalido(true);
      }
    } else {
      alert("Por favor, insira um código de 6 dígitos.");
    }
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
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
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
              className="hover:scale-105 transition-transform duration-300"
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
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white hover:text-purple-300 px-6 py-3 rounded-md transition duration-300"
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

        <div className="flex justify-center items-center">
          <div className="bg-purple-800 border border-purple-400 p-8 rounded-lg shadow-xl w-full max-w-3xl relative flex flex-col items-center justify-center">
            <button
              onClick={() => router.push("/simulacoesaluno")}
              className="absolute top-4 left-4 text-white-600 hover:text-purple-400"
            >
              <ArrowBackIcon fontSize="large" />
            </button>

            <h2 className="text-3xl font-semibold text-center mb-6 text-white-600">Inserir Código</h2>

            <input
              type="text"
              value={codigoDigitado}
              onChange={handleCodigoChange}
              maxLength={6}
              className="w-full p-4 text-4xl text-center border-2 border-purple-400 rounded-md text-black mb-6 uppercase"
              placeholder="_____"
              autoFocus
            />

            {codigoInvalido && (
              <div className="text-red-500 text-xl mb-4">
                Código inválido. Tente novamente.
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleSubmitCodigo}
                className="bg-purple-600 text-white py-3 px-8 rounded-md font-bold hover:bg-purple-500 transition duration-300"
              >
                Confirmar Código
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodigoAluno;