import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { Task } from "../models/TaskModel";

// 🔒 Ensure user is logged in before accessing Firestore
const getUserTasksCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return collection(db, "users", user.uid, "tasks");
};

// ➕ Add a new task
export const addTask = async (task: Omit<Task, 'id'>): Promise<string> => {
  const taskCollection = getUserTasksCollection();
  const docRef = await addDoc(taskCollection, task);
  return docRef.id; // 👈 return Firestore-generated ID
};


// 📥 Fetch all tasks ordered by dueDate

export const getTasks = async (): Promise<Task[]> => {
  const taskCollection = getUserTasksCollection();
  const q = query(taskCollection, orderBy('dueDate', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Task, 'id'>;
    return {
      id: docSnap.id, // ✅ correct Firestore ID
      ...data,
    };
  });
};

// ✏️ Update a task by ID
export const updateTask = async (
  taskId: string,
  updatedTask: Partial<Task>
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const taskRef = doc(db, "users", user.uid, "tasks", taskId);

  // 🧹 Let Firestore throw if doc doesn't exist — no need to pre-check
  await updateDoc(taskRef, updatedTask);
};

// 🗑️ Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
  await deleteDoc(taskDoc);
};
