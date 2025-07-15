// ✂️ imports remain unchanged
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { IconButton, Menu, TextInput } from "react-native-paper";
import { getTasks, updateTask } from "../services/taskService";
import { format } from "date-fns";
import { Task } from "../models/TaskModel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

export default function TaskListScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userInitial, setUserInitial] = useState('');
  const isFocused = useIsFocused();
  const [viewHistory, setViewHistory] = useState(false); // toggle between My Tasks and History


  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
const relevantTasks = viewHistory
  ? data.filter((task) => task.isCompleted)      // completed tasks
  : data.filter((task) => !task.isCompleted);

      const filteredByPriority =
        filterPriority === 'all'
          ? relevantTasks
          : relevantTasks.filter((task) => task.priority === filterPriority);

      const filteredBySearch = filteredByPriority.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setTasks(filteredBySearch);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Rewritten useEffect to load tasks immediately when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused, searchQuery.trim(), filterPriority, viewHistory]);

  useEffect(() => {
    const fetchUserInitial = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.name) {
              setUserInitial(userData.name.charAt(0).toUpperCase());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user initial:', error);
      }
    };

    fetchUserInitial();
  }, []);

  const toggleCompleted = (taskId: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleMarkAsDone = async (task: Task) => {
    setCompletedMap((prev) => ({
      ...prev,
      [task.id]: true,
    }));

    setShowSnackbar(true);
    setDeletedTask(task);

    try {
      await updateTask(task.id, {
        ...task,
        isCompleted: true,
      });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Error updating task in Firestore:", error);
      setCompletedMap((prev) => ({
        ...prev,
        [task.id]: false,
      }));
      setShowSnackbar(false);
      setDeletedTask(null);
    }

    setTimeout(() => {
      setShowSnackbar(false);
      setDeletedTask(null);
    }, 5000);
  };

  const handleUndo = async () => {
    if (deletedTask) {
      setTasks((prev) =>
        prev.some((t) => t.id === deletedTask.id)
          ? prev
          : [deletedTask!, ...prev]
      );

      setCompletedMap((prev) => ({
        ...prev,
        [deletedTask.id]: false,
      }));
      setShowSnackbar(false);

      try {
        await updateTask(deletedTask.id, {
          ...deletedTask,
          isCompleted: false,
        });
      } catch (error) {
        console.error("Error reverting task in Firestore:", error);
      }

      setDeletedTask(null);
    }
  };

  const groupTasks = (): Record<"Today" | "Tomorrow" | "This Week", Task[]> => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const grouped: Record<"Today" | "Tomorrow" | "This Week", Task[]> = {
      Today: [],
      Tomorrow: [],
      "This Week": [],
    };

    tasks.forEach((task) => {
      const due = new Date(task.dueDate);
      if (due.toDateString() === today.toDateString()) grouped.Today.push(task);
      else if (due.toDateString() === tomorrow.toDateString())
        grouped.Tomorrow.push(task);
      else grouped["This Week"].push(task);
    });

    return grouped;
  };

  const renderHistoryList = () => {
  return tasks.map((task) => renderTaskItem(task));
};


const renderTaskItem = (task: Task, isHistoryView: boolean = false) => {
  const isCompleted = task.isCompleted;

  return (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskItem, isCompleted && styles.taskItemCompleted]}
      onPress={() => {
        if (!isCompleted && !isHistoryView) {
          setSelectedTask(task);
        }
      }}
      activeOpacity={isCompleted || isHistoryView ? 1 : 0.8} // Disable press feedback
    >
      <View style={styles.taskInfo}>
        <IconButton
          icon={isCompleted ? "check-circle" : "checkbox-blank-circle-outline"}
          iconColor="#5e5ce6"
          size={22}
           disabled={isCompleted || isHistoryView}
          style={{ margin: 0, padding: 0, backgroundColor: "transparent" }}
          onPress={() => {
            if (!isCompleted && !isHistoryView) handleMarkAsDone(task);
          }}
        />
        <View>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          <Text style={styles.taskDate}>
            {format(new Date(task.dueDate), "d MMM")}
          </Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {task.priority && (
          <View
            style={[
              styles.tag,
              styles[`tag_${task.priority}` as keyof typeof styles],
            ]}
          >
            <Text style={styles.tagText}>{task.priority}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};



  const grouped = groupTasks();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitial || 'U'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tasks..."
              placeholderTextColor="#ccc"
              style={styles.searchInput}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              selectionColor="#fff"
              textColor="#fff"
            />
            {searchQuery.length > 0 && (
              <IconButton
                icon="close"
                size={18}
                onPress={() => setSearchQuery('')}
                iconColor="#fff"
                style={styles.clearButton}
              />
            )}
          </View>

          <IconButton icon="dots-vertical" iconColor="#fff" size={26} onPress={() => {}} />
        </View>

        <Text style={styles.dateText}>Today, {format(new Date(), "d MMM")}</Text>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>
  {viewHistory ? "History" : "My tasks"}
</Text>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="filter-variant"
                iconColor="#fff"
                size={22}
                onPress={openMenu}
                style={{ margin: 0 }}
              />
            }
            contentStyle={styles.menuContent}
          >
            {["all", "low", "medium", "high"].map((level) => (
              <Menu.Item
                key={level}
                onPress={() => {
                  setFilterPriority(level as any);
                  closeMenu();
                }}
                title={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {level !== "all" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor:
                            level === "low"
                              ? "#6cdb4f"
                              : level === "medium"
                              ? "#ffa726"
                              : "#ef5350",
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: filterPriority === level ? "bold" : "normal",
                        color: filterPriority === level ? "#5e5ce6" : "#333",
                      }}
                    >
                      {level.toUpperCase()}
                    </Text>
                  </View>
                }
              />
            ))}
          </Menu>
        </View>
      </View>

      {/* Task List */}
{loading ? (
  <View style={styles.loaderContainer}>
    <Text style={{ marginBottom: 10, color: "#5e5ce6" }}>Loading tasks...</Text>
    <ActivityIndicator size="large" color="#5e5ce6" />
  </View>
) : (
  <ScrollView style={[styles.scrollContainer, viewHistory && {paddingTop:15}]}>
    {viewHistory ? (
      tasks.length === 0 ? (
        <Text style={{ color: '#999', textAlign: 'center', marginTop: 30 }}>
          No completed tasks found.
        </Text>
      ) : (
        tasks.map((task) => renderTaskItem(task, true)) // Render full completed task list
      )
    ) : (
      Object.entries(grouped).map(([section, taskList]) => (
        <View key={section} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section}</Text>
          {taskList.map((task) => renderTaskItem(task))}
        </View>
      ))
    )}
  </ScrollView>
)}


      {/* FAB */}
      <View style={styles.fab}>
        <IconButton icon="pencil-plus" iconColor="#fff" size={25} onPress={() => navigation.navigate("AddTask")} />
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
  <IconButton
    icon="format-list-bulleted"
    size={24}
    iconColor={viewHistory ? "#ccc" : "#5e5ce6"}
    onPress={() => setViewHistory(false)}
  />
  <IconButton
    icon="calendar"
    size={24}
    iconColor={viewHistory ? "#5e5ce6" : "#ccc"}
    onPress={() => setViewHistory(true)}
  />
</View>


      {/* Task Modal */}
      {selectedTask && (
        <Modal transparent animationType="slide" visible={!!selectedTask} onRequestClose={() => setSelectedTask(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalSectionLabel}>Title</Text>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>

              <Text style={styles.modalSectionLabel}>Description</Text>
              <Text style={styles.modalDesc}>
                {selectedTask.description || "No description provided."}
              </Text>

              <Text style={styles.modalSectionLabel}>Due Date</Text>
              <Text style={styles.modalDueDate}>
                {format(new Date(selectedTask.dueDate), "dd MMM yyyy")}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#eee" }]}
                  onPress={() => {
                    setSelectedTask(null);
                    navigation.navigate("EditTask", { task: selectedTask });
                  }}
                >
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#5e5ce6" }]}
                  onPress={() => {
                    handleMarkAsDone(selectedTask);
                    setSelectedTask(null);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: "#fff" }]}>Mark as Done</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Snackbar */}
      {showSnackbar && (
        <View style={styles.snackbarContainer}>
          <View style={styles.snackbarCard}>
            <Text style={styles.snackbarText}>Task marked as done</Text>
            <TouchableOpacity onPress={handleUndo}>
              <Text style={styles.snackbarUndo}>UNDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
 safeArea: {
    flex: 1,
    backgroundColor: '#5e5ce6',
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: 0, // iOS has SafeAreaView built-in
      default: 0,
    }),
  },
  headerContainer: {
    backgroundColor: "#5e5ce6",
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5e5ce6",
  },
  searchBox: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  searchText: {
    color: "#eee",
    fontSize: 16,
  },
  searchInput: {
  backgroundColor: 'transparent',
  fontSize: 16,
  color: '#fff',
  paddingVertical: 0,
  height: 20,
},

clearButton: {
  margin: 0,
  padding: 0,
  position: 'absolute',
  right: 5,
  top: 4,
  zIndex: 1,
},
  dateText: {
    color: "#eee",
    fontSize: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },

  menuContent: {
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionContainer: {
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskItemCompleted: {
    backgroundColor: "#f3f3f3",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskDate: {
    fontSize: 14,
    color: "#777",
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
  },
  tag: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#fff",
    textTransform: "capitalize",
  },
  tag_low: { backgroundColor: "#6cdb4f" },
  tag_medium: { backgroundColor: "#ffa726" },
  tag_high: { backgroundColor: "#ef5350" },
  fab: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#5e5ce6",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    zIndex: 10,
  },
  fabText: {
    fontSize: 30,
    color: "#fff",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalSectionLabel: {
    fontSize: 13,
    color: "#999",
    marginTop: 10,
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modalDesc: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    marginBottom: 5,
  },
  modalDueDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalCloseText: {
    color: "#5e5ce6",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 18,
    fontSize: 14,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  snackbarContainer: {
    position: "absolute",
    bottom: 85,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },

  snackbarCard: {
    flexDirection: "row",
    backgroundColor: "#323232",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  snackbarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },

  snackbarUndo: {
    marginLeft: 20,
    color: "#5e5ce6",
    fontWeight: "700",
    fontSize: 15,
  },
});
