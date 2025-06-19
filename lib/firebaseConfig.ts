import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBXxO580iYZSWoj0teQbou2mV0eyQmPR_w",
  authDomain: "fir-3-f9d1c.firebaseapp.com",
  projectId: "fir-3-f9d1c",
  messagingSenderId: "180403759639",
  appId: "1:180403759639:web:3a4fed7d0454a402770a52",
  measurementId: "G-4V5311RVJL",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);

export default app;
export {app}
