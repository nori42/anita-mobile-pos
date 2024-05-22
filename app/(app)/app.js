import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Stack } from "expo-router/stack";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "red" }}>
        FUCK ME BRUHH I WANT TO START FROM SCRATCH
      </Text>
      {/* <Link push href="(app)/(tabs)/home">
        View Tabs
      </Link>
      <Link push href="(app)/(stack)/home">
        View Stack
      </Link> */}
      {/* <Link push href="(app)/(drawer)/order">
        View Drawer
      </Link> */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
