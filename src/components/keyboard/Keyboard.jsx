import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

const Keyboard = ({ onKeyPress, onClose }) => {
  const keys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const handleKeyPress = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKeyPress(key);
  };

  return (
    <View style={styles.container}>
      {/* Draggable Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Keyboard Rows */}
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handleKeyPress(key)}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.keyPressed,
              ]}
              accessible={true}
              accessibilityLabel={key.toUpperCase()}
              accessibilityRole="button"
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}

      {/* Special Keys Row */}
      <View style={styles.specialRow}>
        <Pressable
          onPress={() => handleKeyPress("backspace")}
          style={({ pressed }) => [
            styles.specialKey,
            styles.deleteKey,
            pressed && styles.deleteKeyPressed,
          ]}
          accessible={true}
          accessibilityLabel="Backspace"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="backspace-outline" size={24} color="white" />
        </Pressable>
        
        <Pressable
          onPress={() => handleKeyPress(" ")}
          style={({ pressed }) => [
            styles.spaceKey,
            pressed && styles.spaceKeyPressed,
          ]}
          accessible={true}
          accessibilityLabel="Space"
          accessibilityRole="button"
        >
          <Text style={styles.spaceKeyText}>Space</Text>
        </Pressable>
        
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.specialKey,
            styles.closeKey,
            pressed && styles.closeKeyPressed,
          ]}
          accessible={true}
          accessibilityLabel="Close Keyboard"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="keyboard-close" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(232, 244, 234, 0.95)",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 6,
    backgroundColor: "#bbb",
    borderRadius: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  key: {
    backgroundColor: "#4CAF50",
    padding: 12,
    margin: 3,
    borderRadius: 12,
    minWidth: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  keyPressed: {
    backgroundColor: "#5cb860",
    transform: [{ scale: 0.95 }],
  },
  keyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
  },
  specialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  specialKey: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },
  deleteKey: {
    backgroundColor: "#c9302c",
  },
  deleteKeyPressed: {
    backgroundColor: "#d9534f",
    transform: [{ scale: 0.95 }],
  },
  spaceKey: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  spaceKeyPressed: {
    backgroundColor: "#ddd",
    transform: [{ scale: 0.98 }],
  },
  spaceKeyText: {
    fontSize: 18,
    color: "#555",
  },
  closeKey: {
    backgroundColor: "#666",
  },
  closeKeyPressed: {
    backgroundColor: "#888",
    transform: [{ scale: 0.95 }],
  },
});

export default Keyboard;
