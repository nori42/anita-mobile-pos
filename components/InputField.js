import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

export default function InputField(props) {
  const { label, placeholder = "", onChangeText, value } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 45,
    marginTop: 6,
    backgroundColor: "#D5D5D5",
    padding: 14,
    borderRadius: 12,
  },

  label: {
    fontWeight: "bold",
    margin: 0,
  },

  container: {
    width: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 20,
  },
});
