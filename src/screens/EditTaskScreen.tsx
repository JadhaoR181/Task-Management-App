import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateTask } from '../services/taskService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task } from '../models/TaskModel';

export default function EditTaskScreen({ navigation, route }: { navigation: any; route: any }) {
  const { task }: { task: Task } = route.params;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(new Date(task.dueDate));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loader state

  const handleUpdate = async () => {
    if (!title || !description || !task.id) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }

    setLoading(true); // ✅ Start loader
    try {
      await updateTask(task.id, {
        title,
        description,
        dueDate: dueDate.toISOString(),
        priority,
      });

      Alert.alert('Success', 'Task updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error("Update failed:", error);
      Alert.alert('Error', error.message || 'Failed to update task');
    } finally {
      setLoading(false); // ✅ End loader
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.headerText}>Edit Task</Text>
          </View>

          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Priority:</Text>
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high'].map((p) => (
              <Button
                key={p}
                mode={priority === p ? 'contained' : 'outlined'}
                onPress={() => setPriority(p as 'low' | 'medium' | 'high')}
                style={styles.priorityButton}
              >
                {p.toUpperCase()}
              </Button>
            ))}
          </View>

          <Text style={styles.label}>Due Date:</Text>
          <Button
            mode="outlined"
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
              setShowTimePicker(false);
            }}
            style={styles.dateButton}
          >
            {dueDate.toDateString()}
          </Button>

          <Text style={styles.label}>Due Time:</Text>
          <Button
            mode="outlined"
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(false);
              setShowTimePicker(true);
            }}
            style={styles.dateButton}
          >
            {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const updated = new Date(dueDate);
                  updated.setFullYear(selectedDate.getFullYear());
                  updated.setMonth(selectedDate.getMonth());
                  updated.setDate(selectedDate.getDate());
                  setDueDate(updated);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const updated = new Date(dueDate);
                  updated.setHours(selectedTime.getHours());
                  updated.setMinutes(selectedTime.getMinutes());
                  setDueDate(updated);
                }
              }}
            />
          )}

          <Button
            mode="contained"
            onPress={handleUpdate}
            disabled={loading}
            style={styles.button}
          >
            {loading ? <ActivityIndicator animating color="white" /> : 'Update Task'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: 0, // iOS has SafeAreaView built-in
      default: 0,
    }),
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateButton: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});
