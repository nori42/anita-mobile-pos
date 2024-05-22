import React, { forwardRef } from "react";
import { Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Button } from "@ui-kitten/components";
import Colors from "@/constants/Colors";

export default function FloatingButton(props, ref) {
  const { onPress, title = "Save", style, color, styleText } = props;

  return (
    // <Pressable style={styles.container}>
    //   <TouchableOpacity
    //     style={[styles.button, style]}
    //     onPress={onPress}
    //     activeOpacity={0.8}
    //   >
    //     <Text style={[styles.text, { color: color }, styleText]}>{title}</Text>
    //   </TouchableOpacity>
    // </Pressable>
    <Button style={styles.button}>{title}</Button>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 60,
    borderRadius: 50,
    elevation: 3,
    backgroundColor: Colors.light.primary,
  },
  text: {
    fontSize: 21,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});
