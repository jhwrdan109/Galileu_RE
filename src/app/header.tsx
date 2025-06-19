"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  scrollToQuemSomos?: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrollToQuemSomos }) => {
  const router = useRouter();

  return (
    <header className="absolute top-0 left-0 w-full py-4 px-8 flex flex-col md:flex-row justify-between items-center z-50 bg-transparent">
      {/* Logo */}
      <div className="mb-4 md:mb-0">
        <img
          src="/images/markim-Photoroom.png"
          alt="Logo Projeto Galileu"
          width={150}
          height={50}
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Navegação */}
      <nav>
        <ul className="flex flex-wrap justify-center gap-6">
          {["Início", "Simulações"].map((item) => (
            <li key={item}>
              <button
                onClick={() => router.push("/login")}
                className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
              >
                {item}
              </button>
            </li>
          ))}

          {/* Botão Quem Somos */}
          <li>
            <button
              onClick={scrollToQuemSomos}
              className="text-white px-6 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg"
            >
              Quem Somos
            </button>
          </li>

          {/* Botão Entrar */}
          <li>
            <button
              onClick={() => router.push("/login")}
              className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl"
            >
              ENTRAR
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
