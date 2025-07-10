import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig"; // ensure you export db from firebaseConfig

export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

export const getUserName = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.name || null;
  }
  return null;
};
// ✅ Save user info (without password)
export const saveUserInfo = async (uid: string, name: string, email: string) => {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    createdAt: new Date(),
  });
};
