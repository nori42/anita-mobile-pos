import React, { forwardRef } from "react";
import { Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";

export default forwardRef(function Button(props, ref) {
  const { onPress, title = "Save", style, color, styleText } = props;

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={([styles.text], { color: color }, styleText)}>{title}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});
