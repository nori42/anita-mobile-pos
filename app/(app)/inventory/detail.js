import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import { Text, Input, Button } from "@ui-kitten/components";
import { useLocalSearchParams, Link } from "expo-router";
import { Image } from "expo-image";
import productsjson from "@/data/products.json";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import BarCode from "@/components/BarCode";
import Loader from "@/components/Loader";

export default function InventoryDetail() {
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [product, setProduct] = useState({
    id: null,
    name: null,
    price: 0,
    stock: null,
    category: null,
    description: null,
    barcode_id: null,
    img_uri: null,
  });
  const db = useSQLiteContext();

  console.log(product);

  useEffect(() => {
    const getProduct = async () => {
      const query = await db.getFirstAsync(
        `SELECT * FROM products WHERE products.id = ${id}`
      );

      setProduct((prev) => ({ ...prev, ...query }));
    };
    getProduct();
  }, []);

  if (product.id == null) return <Loader title="Fetching..." />;

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Input label="Stock" color="#000" {...{ inputMode: "numeric" }} />
            <Button style={{ marginTop: 10, width: "100%" }}>Update</Button>
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Image
        style={styles.image}
        source={
          product.img_uri == null
            ? require("@/assets/images/products/default.png")
            : { uri: product.img_uri }
        }
        contentFit="cover"
        transition={1000}
      />
      <View style={styles.productHeader}>
        <Text style={{ fontWeight: "bold" }}>{product.name}</Text>
        <Text>Stock:{product.stock} </Text>
      </View>
      <Text
        status={"primary"}
        style={{ fontSize: 24, width: "100%", marginVertical: 10 }}
      >
        ₱{product.price.toFixed(2)}
      </Text>

      {/* Divider */}
      <View
        style={{
          width: "100%",
          marginVertical: 10,
          borderBottomWidth: 1,
          borderColor: "#aaaa",
        }}
      />
      <View style={{ width: "100%", marginBottom: 60 }}>
        <Text style={{ fontWeight: "700" }}>Description</Text>
        <Text>{product.description}</Text>
      </View>
      <View>
        <Text style={{ textAlign: "center", fontSize: 18 }}>
          {product.barcode_id}
        </Text>
        {product.barcode_id ? (
          <BarCode value={product.barcode_id} />
        ) : undefined}
      </View>
      <View style={styles.btnContainer}>
        {/* <Button
          onPress={() => setModalVisible(!modalVisible)}
          children={<Text>Update Stock</Text>}
          disabled={modalVisible}
        /> */}

        <Link
          href={{ params: { id: id }, pathname: "inventory/editProduct" }}
          asChild
        >
          <Button
            onPress={() => {}}
            children={<Text>Edit Product</Text>}
            disabled={modalVisible}
          />
        </Link>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

function UpdateStockModal() {
  return (
    <View style={styles.modalContainer}>
      <Text>Stock Update</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 25,
  },
  image: {
    height: 150,
    width: "100%",
  },
  productHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    gap: 10,
  },

  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    position: "absolute",
    top: 15,
    right: 25,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 25,
    marginTop: 22,
  },
});
