import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
export default function Card(props) {
  const { onPress: handleItemPress, product } = props;
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          handleItemPress(product.id);
        }}
      >
        <Image
          source={
            product.imgUri == null
              ? require("@/assets/images/products/default.png")
              : { uri: product.imgUri }
          }
          resizeMode="stretch"
          style={{
            width: "auto",
            height: 130,
          }}
        />
        <Text
          style={{
            marginTop: 10,
            marginLeft: 10,
            fontSize: 18,
            fontWeight: "bold",
            color: Colors.light.primary,
          }}
        >
          ₱{Number(product.price).toFixed(2)}
        </Text>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <Text>{product.label}</Text>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "flex-end",
            }}
          >
            <Text>Stock:</Text>
            <Text style={{ fontWeight: "bold" }}>{product.stock}</Text>
          </View>
        </View>
      </TouchableOpacity>
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
