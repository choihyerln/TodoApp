import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = '@toDos';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const addToDo = async () => {
    if (text === "") {
      return
    }
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working }
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
    catch (e) {
      console.error("error");
    }
  }

  const loadToDos = async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value)
      setToDos(JSON.parse(value));
  }

  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("정말로 삭제하시겠습니까?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("정말로 삭제하시겠습니까?", null, [
        { text: "취소" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          }
        }
      ]);
    }
  }

  useEffect(() => {
    loadToDos();
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: working ? theme.grey : "white" }}>Travel</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        returnKeyType='done'
        onChangeText={e => setText(e)}
        onSubmitEditing={addToDo}
        value={text}
        placeholder={working ? "할 일을 추가하세요." : "어디에 가고 싶습니까?"}
        style={styles.input} />

      <ScrollView>
        {Object.keys(toDos).map(key => (
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText} >{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => { deleteToDo(key) }}>
                <Text><Fontisto name="trash" size={18} color={theme.todobg} /></Text>
              </TouchableOpacity>
            </View>
          ) : null
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    marginVertical: 20,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 15,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

  },
  toDoText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
});