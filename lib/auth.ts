import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { auth, database } from "./firebaseConfig";
import { ref, set, get } from "firebase/database";

const saveUserToDatabase = async (uid: string, name: string, email: string, accountType: "estudante" | "professor") => {
  await set(ref(database, `users/${uid}`), { uid, name, email, accountType });
};

export const signUp = async (name: string, email: string, password: string, accountType: "estudante" | "professor") => {
  if (!name || !email || !password || !accountType) {
    throw new Error("Todos os campos são obrigatórios!");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  await saveUserToDatabase(user.uid, name, email, accountType);

  return userCredential;
};

export const signInWithGoogle = async (accountType: "estudante" | "professor") => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (!user.displayName) {
    throw new Error("Erro ao obter nome do usuário do Google.");
  }

  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await saveUserToDatabase(user.uid, user.displayName, user.email || "", accountType);
  } else {
    accountType = snapshot.val().accountType;
  }

  return accountType;
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  if (!email) throw new Error("O e-mail é obrigatório!");
  await sendPasswordResetEmail(auth, email);
};
