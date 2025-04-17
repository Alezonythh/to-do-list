import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/MaterialIcons'

class Task {
  id: string
  title: string
  completed: boolean

  constructor(id: string, title: string, completed: boolean = false) {
    this.id = id
    this.title = title
    this.completed = completed
  }
}

const Checkbox = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => {
  return (
    <TouchableOpacity onPress={onToggle}>
      <Icon
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  )
}

const TaskItem = ({ task, onToggle, onEdit, onDelete }: any) => {
  return (
    <View style={tw`bg-gray-800 p-3 rounded mt-3 flex-row justify-between items-center`}>
      <Checkbox checked={task.completed} onToggle={() => onToggle(task.id)} />
      <Text style={[tw`text-white flex-1 ml-3`]}>
        {task.title}
      </Text>
      <View style={tw`flex-row`}>
        <TouchableOpacity
          style={tw`p-2 rounded bg-blue-500 mr-2`}
          onPress={() => onEdit(task)}
        >
          <Icon name="edit" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`p-2 rounded bg-red-500`}
          onPress={() => onDelete(task.id)}
        >
          <Icon name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const Index = () => {
  const [task, setTask] = useState('')
  const [list, setList] = useState<Task[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    if (list.length > 0) {
      saveTask()
    }
  }, [list])

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem('tasks')
      if (saved !== null) {
        setList(JSON.parse(saved))
      }
      console.log('Tasks loaded successfully')
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const saveTask = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(list))
      console.log('Tasks saved successfully')
    } catch (error) {
      console.error('Error saving tasks:', error)
    }
  }

  const addTask = () => {
    if (task.trim() === '') return
    const newTask = new Task(Date.now().toString(), task.trim())
    setList([...list, newTask])
    setTask('')
  }

  const deleteTask = (id: string) => {
    const filtered = list.filter((item) => item.id !== id)
    setList(filtered)
  }

  const toggleTask = (id: string) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setList(updated)
  }

  const handleEdit = () => {
    const updated = list.map((item) =>
      item.id === editId ? { ...item, title: task.trim() } : item
    )
    setList(updated)
    setTask('')
    setIsEditing(false)
    setEditId('')
  }

  const startEdit = (item: Task) => {
    setTask(item.title)
    setIsEditing(true)
    setEditId(item.id)
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-black p-5`}>
      <Text style={tw`text-white font-bold text-2xl`}>To Do List</Text>

      <View style={tw`flex-row items-center mt-10`}>
        <TextInput
          style={tw`flex-1 border border-gray-300 text-white rounded p-3 mr-2`}
          placeholder="Tambahkan Tugas"
          placeholderTextColor="#ffff"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          style={tw`bg-blue-500 p-3 rounded`}
          onPress={isEditing ? handleEdit : addTask}
        >
          <Icon name={isEditing ? 'save' : 'add'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={toggleTask}
            onEdit={startEdit}
            onDelete={deleteTask}
          />
        )}
        ListEmptyComponent={() => (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`text-white font-bold text-lg`}>Tidak ada tugas</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={tw`mb-5`}>
            <Text style={tw`text-white font-bold text-lg`}>Total Tugas: {list.length}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={tw`mb-5 mt-5`}>
            <Text style={tw`text-white font-bold text-lg`}>Daftar Tugas</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Index
