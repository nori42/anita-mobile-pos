import * as eva from "@eva-design/eva";
import { ApplicationProvider, Button } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Link } from "expo-router";
import { StyleSheet, Text, View, Image } from "react-native";
import Colors from "@/constants/Colors";
import { default as theme } from "@/constants/theme.json";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import Variables from "@/constants/Variables";

export default function Index() {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          height={50}
          width={50}
          resizeMode="cover"
        />
      </View>

      <View style={styles.container}>
        {/* 
        <InputField label="Username" placeholder="Username" />
        <InputField label="Password" placeholder="Password" /> */}
        <Text style={styles.heading}>Welcome To Anita Mobile POS</Text>
        <Link href="/(app)/(drawer)/order" asChild={true}>
          <Button onPress={() => {}} style={{ width: "100%" }}>
            START
          </Button>
        </Link>
        {/* <Button
          onPress={async () => {
            await SQLite.deleteDatabaseAsync(DbConfig.name);
            await Variables.deleteDirectory();
          }}
          style={{ width: "100%" }}
        >
          RESET DATABASE
        </Button> */}
        <StatusBar style="auto" />
      </View>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 35,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  header: {
    flex: 0.225,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
  },

  heading: {
    color: Colors.light.primary,
    alignSelf: "flex-start",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
  },
});
