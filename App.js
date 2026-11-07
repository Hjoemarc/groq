
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace with the reachable address of your backend
  const BASE_URL = "http://192.168.1.110:3001";

  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(`${BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setAnswer(data.answer);

    } catch (error) {
      setAnswer("Error: " + error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        AI Chat Assistant
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your question"
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <Button
        title="Ask AI"
        onPress={askAI}
        disabled={loading}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 20 }}
        />
      )}

      {answer !== "" && (
        <View style={styles.response}>
          <Text style={styles.label}>
            AI Response:
          </Text>

          <Text>{answer}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  response: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
});
