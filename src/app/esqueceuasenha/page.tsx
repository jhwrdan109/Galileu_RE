"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EsqueceuSenha: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Um link de recuperação foi enviado para o seu e-mail.");
    } catch (err: any) {
      setError("Erro ao enviar e-mail. Verifique se está correto!");
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-end bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
      }}
    >
      <ArrowBackIcon
        className="absolute top-4 left-4 text-white cursor-pointer hover:scale-110 transition"
        fontSize="large"
        onClick={() => router.push("/login")}
      />

      <div className="bg-purple-900 p-6 rounded-lg shadow-lg w-96 border-4 border-purple-300 relative mr-10">
        <h2 className="text-white text-2xl font-bold mb-2">Esqueceu a senha?</h2>
        <p className="text-white text-sm mb-4">Entre com o e-mail associado com sua conta.</p>

        {message && <p className="text-green-400 text-sm mb-2">{message}</p>}
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <form onSubmit={handleResetPassword}>
          <label className="text-gray-300 text-sm block mb-1">Email para recuperação</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-gray-200 text-black text-sm mb-3"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-bold hover:bg-gray-300 transition duration-300"
          >
            Avançar
          </button>
        </form>
        
        <div className="relative flex justify-center mt-4">
          <Image
            src="/images/galileuimagem.png"
            alt="Galileu"
            width={200} 
            height={300}
            className="object-contain"
          />
          <Image
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={80}
            height={80}
            className="absolute bottom-28 right-11 transform scale-75"
          />
        </div>
      </div>
    </div>
  );
};

export default EsqueceuSenha;