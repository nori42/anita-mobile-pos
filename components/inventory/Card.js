import { Link } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function Card(props) {
  const { label, stock, id, imgUri } = props;
  return (
    <View style={styles.container}>
      <Link href={{ params: { id: id }, pathname: "inventory/detail" }} asChild>
        <TouchableOpacity activeOpacity={0.7}>
          <Image
            source={
              imgUri == null
                ? require("@/assets/images/products/default.png")
                : { uri: imgUri }
            }
            resizeMode="stretch"
            style={{
              width: "auto",
              height: 130,
            }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <Text>{label}</Text>
            <View
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
              }}
            >
              <Text>Stock:</Text>
              <Text style={{ fontWeight: "bold" }}>{stock}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    backgroundColor: "white",
    margin: 4,
  },
});
