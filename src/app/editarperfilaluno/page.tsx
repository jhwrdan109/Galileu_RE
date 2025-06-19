/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from '../../../lib/supabase';
import { auth } from '../../../lib/firebaseConfig'; // Ajuste o caminho conforme sua estrutura
import { onAuthStateChanged } from 'firebase/auth';
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import LanguageIcon from "@mui/icons-material/Language";
import PasswordIcon from "@mui/icons-material/Password";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

const Editarperfilaluno: React.FC = () => {
  const router = useRouter();
  
  const [user, setUser] = useState({
    uid: "", // Mudança: usar UID do Firebase
    name: "Aluno",
    email: "",
    accountType: "Estudante",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showTranslator, setShowTranslator] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar mudanças de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuário autenticado
        const storedUser = localStorage.getItem("user");
        let userData = {
          name: "Aluno",
          email: firebaseUser.email || "",
          accountType: "Estudante"
        };

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          userData = {
            name: parsedUser.name || firebaseUser.displayName || "Aluno",
            email: parsedUser.email || firebaseUser.email || "",
            accountType: parsedUser.accountType || "Estudante"
          };
        }

        setUser({
          uid: firebaseUser.uid, // UID único do Firebase
          name: userData.name,
          email: userData.email,
          accountType: userData.accountType,
        });

        // Carregar foto de perfil usando o UID do Firebase
        loadProfileImage(firebaseUser.uid);
        setLoading(false);
      } else {
        // Usuário não autenticado
        router.push("/login");
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, [router]);

  const loadProfileImage = async (userId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('arquivos')
        .list(`foto-de-perfil/${userId}`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Erro ao buscar foto de perfil:', error);
        return;
      }

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('arquivos')
          .getPublicUrl(`foto-de-perfil/${userId}/${data[0].name}`);
        
        setProfileImage(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar foto de perfil:', error);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `foto-de-perfil/${user.uid}/${fileName}`; // Usar UID do Firebase

      // Remover foto anterior se existir
      try {
        const { data: existingFiles } = await supabase.storage
          .from('arquivos')
          .list(`foto-de-perfil/${user.uid}`); // Usar UID do Firebase

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `foto-de-perfil/${user.uid}/${file.name}`);
          await supabase.storage
            .from('arquivos')
            .remove(filesToDelete);
        }
      } catch (error) {
        console.log('Nenhuma foto anterior encontrada ou erro ao remover:', error);
      }

      // Upload da nova foto
      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath);

      setProfileImage(urlData.publicUrl);
      
      // Opcional: Salvar URL no perfil do usuário no banco de dados
      // Aqui você pode adicionar código para atualizar a tabela de usuários com a URL da foto

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleLanguageToggle = () => {
    if (showTranslator) {
      setShowTranslator(false);
    } else {
      setShowTranslator(true);
      if (!document.querySelector("#google_translate_script")) {
        const script = document.createElement("script");
        script.id = "google_translate_script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);

        // Define a função de callback global para o tradutor
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "pt", // Define o idioma da página como Português
              includedLanguages: "en,pt,es,fr,de,it", // Idiomas incluídos
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        };
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center text-white p-8 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/sooroxo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="w-full container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
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
          <ul className="flex flex-wrap justify-center gap-6 items-center">
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
                className="text-white px-6 py-3 rounded-md font-bold border border-purple-400"
              >
                Simulações
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/editarperfilaluno")}
                className="bg-purple-600 text-white px-8 py-3 rounded-md font-bold transition duration-300 flex items-center gap-2"
              >
                <AccountCircleOutlinedIcon />
                {user.name}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Containers de Edição */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full max-w-5xl mt-12">
        {/* Container da Esquerda */}
        <div className="bg-purple-800 p-8 rounded-lg w-full md:w-2/5 shadow-lg border border-purple-400">
          <div className="space-y-5">
            <button className="w-full bg-red-600 py-3 rounded-md hover:bg-red-500 flex items-center justify-center gap-2 text-lg">
              <DeleteIcon />
              Deletar conta
            </button>
            <button
              className="w-full bg-yellow-500 py-3 rounded-md hover:bg-yellow-400 flex items-center justify-center gap-2 text-lg"
              onClick={() => setShowAccountModal(true)}
            >
              <AccountCircleOutlinedIcon />
              Mudar tipo de conta
            </button>
            <button className="w-full bg-blue-500 py-3 rounded-md hover:bg-blue-400 flex items-center justify-center gap-2 text-lg">
              <PasswordIcon />
              Alterar Senha
            </button>
            <button
              className="w-full bg-gray-600 py-3 rounded-md hover:bg-gray-500 flex items-center justify-center gap-2 text-lg"
              onClick={handleLanguageToggle}
            >
              <LanguageIcon />
              Idioma
            </button>
            {showTranslator && (
              <div id="google_translate_element" className="mt-4 text-black bg-white rounded-md p-2" />
            )}
          </div>
        </div>

        {/* Container da Direita */}
        <div className="bg-purple-900 p-10 rounded-lg w-full md:w-3/5 shadow-lg border border-purple-400 bg-opacity-90 flex flex-col items-center">
          <div className="relative">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Perfil"
                width={150}
                height={150}
                className="rounded-full border-4 border-purple-400 object-cover w-[150px] h-[150px]"
              />
            ) : (
              <div className="w-[150px] h-[150px] rounded-full border-4 border-purple-400 bg-purple-700 flex items-center justify-center">
                <PersonIcon style={{ fontSize: 80, color: '#a78bfa' }} />
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading}
            />
            <label
              htmlFor="fileInput"
              className={`absolute bottom-0 right-0 p-3 rounded-full text-white transition cursor-pointer ${
                uploading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PhotoCameraIcon />
              )}
            </label>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-md text-gray-300">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-md text-gray-400 mt-2">
              <span className="font-semibold">Tipo de Conta:</span> Estudante
            </p>
          </div>

          <button
            className="mt-8 w-full bg-purple-600 py-3 rounded-md hover:bg-purple-500 flex justify-center items-center gap-2 text-lg"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogoutIcon />
            Encerrar sessão
          </button>
        </div>
      </div>

      {/* MODAL - Mudar Tipo de Conta */}
      {showAccountModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-purple-900 border border-purple-400 p-8 rounded-lg text-center shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-6">Escolha o tipo de conta</h2>
            <button 
              onClick={() => router.push("")}
              className={`w-full py-3 rounded-md mb-4 ${user.accountType === "Estudante" ? "bg-purple-600 text-white" : "bg-white text-purple-600 border border-purple-600"}`}
            >
              Estudante
            </button>
            <button 
              onClick={() => router.push("/editarperfilprof")}
              className={`w-full py-3 rounded-md ${user.accountType === "Professor" ? "bg-purple-600 text-white" : "bg-white text-purple-600 border border-purple-600"}`}
            >
              Professor
            </button>
            <button className="mt-4 text-white hover:text-gray-300" onClick={() => setShowAccountModal(false)}>
              <CloseIcon /> Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL - Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-purple-900 border border-purple-400 p-8 rounded-lg text-center shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-6">Você tem certeza que deseja encerrar a sessão?</h2>
            <button 
              onClick={handleLogout} 
              className="w-full py-3 rounded-md mb-4 bg-red-600 text-white hover:bg-red-500"
            >
              Sim, Encerrar
            </button>
            <button 
              onClick={() => setShowLogoutModal(false)} 
              className="w-full py-3 rounded-md bg-gray-600 text-white hover:bg-gray-500"
            >
              Não, Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editarperfilaluno;