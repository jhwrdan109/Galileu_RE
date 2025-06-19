"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "../../../lib/firebaseConfig";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Cadastro: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"estudante" | "professor">("estudante");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await set(ref(database, `users/${user.uid}`), {
        name,
        email,
        accountType,
      });

      localStorage.setItem("user", JSON.stringify({ name, email, accountType, uid: user.uid })); // Incluímos o uid aqui

      router.push(accountType === "professor" ? "/dashboardprof" : "/dashboardaluno");
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setError("Erro ao criar conta. Tente novamente!");
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      let userData;

      if (snapshot.exists()) {
        userData = snapshot.val();
        localStorage.setItem("user", JSON.stringify({ ...userData, uid: user.uid })); // Incluímos o uid aqui
      } else {
        userData = { name: user.displayName, email: user.email, accountType: "estudante" };
        await set(userRef, userData);
        localStorage.setItem("user", JSON.stringify({ ...userData, uid: user.uid })); // Incluímos o uid aqui também
      }

      router.push("/dashboardaluno");
    } catch (err: any) {
      console.error("Erro ao fazer login com Google:", err);
      setError("Erro ao autenticar com Google. Tente novamente!");
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-start bg-cover bg-center p-6 overflow-y-auto"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 🔹 Ícone de voltar */}
      <ArrowBackIcon
        className="absolute top-4 left-4 text-white cursor-pointer hover:scale-110 transition"
        fontSize="large"
        onClick={() => router.push("/")}
      />

      <div className="p-6 rounded-lg shadow-xl w-full max-w-md ml-10"> {/* 🔹 Formulário deslocado para a esquerda */}
        <div className="flex justify-center mb-3">
          <Image
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={110}
            height={40}
            className="hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h2 className="text-white-900 text-lg font-bold text-center">Cadastro</h2>

        {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}

        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="text-white-700 text-sm block mb-1">Nome</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-white-100 text-gray-800 text-sm border"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-white-700 text-sm block mb-1">E-mail</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-white-100 text-gray-800 text-sm border"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-white-700 text-sm block mb-1">Senha</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-white-100 text-gray-800 text-sm border"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-white-700 text-sm block mb-1">Confirmar Senha</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-white-100 text-gray-800 text-sm border"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-white-700 text-sm block mb-1">Tipo de Conta</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAccountType("estudante")}
                className={`w-1/2 p-2 rounded-md text-sm font-bold border ${
                  accountType === "estudante" ? "bg-purple-600 text-white" : "bg-white text-purple-600 border-purple-600"
                } transition duration-300`}
              >
                Estudante
              </button>
              <button
                type="button"
                onClick={() => setAccountType("professor")}
                className={`w-1/2 p-2 rounded-md text-sm font-bold border ${
                  accountType === "professor" ? "bg-purple-600 text-white" : "bg-white text-purple-600 border-purple-600"
                } transition duration-300`}
              >
                Professor
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-500 font-bold text-sm transition duration-300"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-3 text-center">
          <p className="text-white-700 text-sm mb-2">Ou cadastre-se com:</p>
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-500 font-bold text-sm transition duration-300"
          >
            Google
          </button>
        </div>

        {/* 🔹 Link para login */}
        <p className="text-white-700 text-sm text-center mt-4">
          Já tem conta?{" "}
          <span
            className="text-yellow-300 font-bold cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Faça login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;