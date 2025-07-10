// Replace with your actual Firebase config
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyC5FW0jFFn32IvRyh_qX_qSIpmSv_pj6BI",
  authDomain: "whatbytes-task-manager.firebaseapp.com",
  projectId: "whatbytes-task-manager",
  storageBucket: "whatbytes-task-manager.firebasestorage.app",
  messagingSenderId: "304012757431",
  appId: "1:304012757431:web:1769cb61a282f865324032",
  
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
