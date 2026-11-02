import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnkrkRWDNPTcTUfjoO9KAWCykFzMlQ1KY",
  authDomain: "orsoheladeria.firebaseapp.com",
  projectId: "orsoheladeria",
  storageBucket: "orsoheladeria.firebasestorage.app",
  messagingSenderId: "180398868905",
  appId: "1:180398868905:web:f7f5958a1e4dee1c685cb8",
  measurementId: "G-QRR8R7LDSF"
};

const app = initializeApp(firebaseConfig);

let analytics = null;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("Firebase Analytics no está disponible en este navegador.", error);
}

const databaseURL = "https://orsoheladeria-default-rtdb.firebaseio.com/";

export const db = databaseURL ? getDatabase(app, databaseURL) : null;
export { app, analytics };
