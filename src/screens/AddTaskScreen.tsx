import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask } from '../services/taskService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task } from '../models/TaskModel';


export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const taskData: Omit<Task, 'id'> = {
        title: trimmedTitle,
        description: trimmedDescription,
        dueDate: dueDate.toISOString(),
        priority,
        isCompleted: false,
        date: new Date().toISOString(), // ✅ Required field in your model
      };

      await addTask(taskData);

      Alert.alert('Success', 'Task added successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add New Task</Text>
      </View>

      <View style={styles.container}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          editable={!isSubmitting}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          editable={!isSubmitting}
        />

        <Text style={styles.label}>Priority:</Text>
        <View style={styles.priorityRow}>
          {['low', 'medium', 'high'].map((p) => (
            <Button
              key={p}
              mode={priority === p ? 'contained' : 'outlined'}
              onPress={() => !isSubmitting && setPriority(p as any)}
              style={styles.priorityButton}
              disabled={isSubmitting}
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
            setShowTimePicker(false);
            setShowDatePicker(true);
          }}
          style={styles.dateButton}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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

        {isSubmitting ? (
          <ActivityIndicator animating={true} size="large" style={styles.loader} />
        ) : (
          <Button
            mode="contained"
            onPress={handleAdd}
            style={styles.button}
            disabled={isSubmitting}
          >
            Add Task
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: 0,
      default: 0,
    }),
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: { marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 5, fontWeight: 'bold' },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: { flex: 1, marginHorizontal: 4 },
  dateButton: { marginBottom: 10 },
  button: { marginTop: 20 },
  loader: { marginTop: 20 },
});
