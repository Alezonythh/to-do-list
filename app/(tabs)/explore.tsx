import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { AntDesign } from '@expo/vector-icons';

const Explore = () => {
  const [task, setTask] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const getDaysInMonth = (month, year) => {
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const formatDate = (day, month, year) => {
    return `${day} ${months[month]} ${year}`;
  };

  const saveTasksToStorage = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }
  };

  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const addTask = () => {
    if (!task || !subject || !date) return;

    if (editingTaskId) {
      const updatedTasks = tasks.map(item =>
        item.id === editingTaskId
          ? { ...item, task, subject, date }
          : item
      );
      setTasks(updatedTasks);
      setEditingTaskId(null);
    } else {
      const newTask = {
        id: Date.now().toString(),
        task,
        subject,
        date,
        completed: false,
      };
      setTasks([...tasks, newTask]);
    }

    setTask('');
    setSubject('');
    setDate('');
  };

  const startEdit = (item) => {
    setTask(item.task);
    setSubject(item.subject);
    setDate(item.date);
    setEditingTaskId(item.id);
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Hapus Tugas",
      "Apakah kamu yakin ingin menghapus tugas ini?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", onPress: () => deleteTask(id), style: "destructive" }
      ]
    );
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(item => item.id !== id);
    setTasks(updatedTasks);
  };

  const renderItem = ({ item }) => (
    <View style={tw`bg-gray-800 rounded-xl p-3 mb-3 shadow-md flex-row justify-between items-center`}>
      <View style={tw`flex-row items-center flex-1`}>
        <TouchableOpacity
          style={tw`w-6 h-6 rounded-md mr-3 ${item.completed ? 'bg-green-700' : 'border-2 border-gray-400'}`}
          onPress={() => toggleComplete(item.id)}
        >
          {item.completed && (
            <AntDesign name="check" size={14} color="white" style={tw`self-center mt-0.5`} />
          )}
        </TouchableOpacity>
        <View>
          <Text style={tw`text-base font-bold ${item.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
            {item.task}
          </Text>
          <Text style={tw`text-gray-400`}>Mapel {item.subject}</Text>
          <Text style={tw`text-red-400 font-bold mt-1`}>{item.date}</Text>
        </View>
      </View>
      <View style={tw`flex-row`}>
        <TouchableOpacity style={tw`p-2 bg-blue-700 rounded-md mr-2`} onPress={() => startEdit(item)}>
          <AntDesign name="edit" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={tw`p-2 bg-red-700 rounded-md`} onPress={() => confirmDelete(item.id)}>
          <AntDesign name="delete" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-black pt-15`}>
      <View style={tw`flex-1 p-4`}>
        <Text style={tw`text-xl font-bold mb-4 text-white`}>📋 Tugasku</Text>

        <TextInput
          placeholder="Ada tugas apa hari ini?"
          placeholderTextColor="gray"
          style={tw`border rounded-md px-3 py-2 mb-3 bg-gray-900 text-white`}
          value={task}
          onChangeText={setTask}
        />
        <TextInput
          placeholder="Mapelnya apa tu?"
          placeholderTextColor="gray"
          style={tw`border rounded-md px-3 py-2 mb-3 bg-gray-900 text-white`}
          value={subject}
          onChangeText={setSubject}
        />

        <View style={tw`flex-row items-center mb-3`}>
          <TextInput
            placeholder="Pilih tanggal"
            placeholderTextColor="gray"
            style={tw`flex-1 border rounded-md px-3 py-2 bg-gray-900 text-white`}
            value={date}
            editable={false}
          />
          <TouchableOpacity
            onPress={() => setShowDateModal(true)}
            style={tw`ml-2 p-3 bg-gray-700 rounded-md`}
          >
            <AntDesign name="calendar" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={tw`bg-blue-700 py-3 rounded-md mb-6`}
          onPress={addTask}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {editingTaskId ? 'Simpan Perubahan' : 'Tambah Tugas'}
          </Text>
        </TouchableOpacity>

        {tasks.length > 0 ? (
          <>
            <Text style={tw`font-bold mb-2 text-white`}>ADA TUGAS NI KAMU!</Text>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          </>
        ) : (
          <Text style={tw`text-center text-gray-500`}>YEAY GADA TUGAS KAMU</Text>
        )}
      </View>

      {/* Modal Tanggal */}
      {showDateModal && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <View style={tw`bg-gray-900 p-4 rounded-lg w-80`}>
            <Text style={tw`text-lg font-bold mb-4 text-center text-white`}>Pilih Tanggal</Text>

            {/* Navigasi Bulan */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                  const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                  setSelectedMonth(newMonth);
                  setSelectedYear(newYear);
                }}
                style={tw`p-2`}
              >
                <AntDesign name="left" size={16} color="white" />
              </TouchableOpacity>

              <Text style={tw`text-white font-bold text-center`}>
                {months[selectedMonth]} {selectedYear}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                  const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                  setSelectedMonth(newMonth);
                  setSelectedYear(newYear);
                }}
                style={tw`p-2`}
              >
                <AntDesign name="right" size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* Grid Tanggal */}
            <FlatList
              data={getDaysInMonth(selectedMonth, selectedYear)}
              keyExtractor={(item) => item.toString()}
              numColumns={7}
              renderItem={({ item: day }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDay(day);
                    setDate(formatDate(day, selectedMonth, selectedYear));
                    setShowDateModal(false);
                  }}
                  style={tw`w-8 h-8 m-1 rounded-md bg-gray-700 justify-center items-center ${
                    selectedDay === day ? 'bg-blue-600' : ''
                  }`}
                >
                  <Text style={tw`text-center text-white text-base`}>{day}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={tw`flex-wrap justify-center`}
            />

            <TouchableOpacity
              onPress={() => setShowDateModal(false)}
              style={tw`mt-4 bg-red-700 py-2 rounded-md`}
            >
              <Text style={tw`text-white text-center font-bold`}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Explore;
