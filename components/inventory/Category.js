import React, { forwardRef, useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import Colors from "@/constants/Colors";

export default forwardRef(function Category(props, ref) {
  const {
    onPress,
    categoryId,
    title = "Category",
    style,
    color,
    styleText,
    activeCategory,
  } = props;
  const isActive = activeCategory === categoryId;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        { backgroundColor: pressed ? "#AFADAD" : "white" },
        { backgroundColor: isActive ? Colors.light.primary : "white" },
      ]}
      onPress={() => {
        onPress((current) => {
          if (current != categoryId) return categoryId;
          else return "";
        });
      }}
    >
      <Text
        style={[styles.text, styleText, { color: isActive ? "white" : color }]}
      >
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginHorizontal: 3,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});
