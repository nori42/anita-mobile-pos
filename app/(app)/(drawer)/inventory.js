import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@ui-kitten/components";
import Card from "@/components/inventory/Card";
import Category from "@/components/inventory/Category";
import { Link } from "expo-router";
import { useFocusEffect, useNavigation } from "expo-router";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

export default function Inventory() {
  const [search, onChangeSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerUsed, setScannerUsed] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [barcodeSound, setBarCodeSound] = useState();

  // Camera Reference
  const cameraRef = useRef();

  // Navigation
  const navigation = useNavigation();

  // When page is visit load the products
  useFocusEffect(
    useCallback(() => {
      navigation.dispatch(DrawerActions.openDrawer());
      navigation.dispatch(DrawerActions.closeDrawer());
      console.log("Fetch Products");
      initProducts();

      return () => {
        // Cleanup function
      };
    }, [])
  );

  // Barcode sound
  async function playBarcodeScanSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sound/barcode_scanner_beep_sound.mp3")
    );
    setBarCodeSound(sound);

    await sound.playAsync();
  }

  // Unload sound after used to prevent memory leak
  useEffect(() => {
    return barcodeSound
      ? () => {
          barcodeSound.unloadAsync();
        }
      : undefined;
  }, [barcodeSound]);

  const handleScan = async () => {
    // await cameraRef.current.takePictureAsync({
    //   onPictureSaved: async (pic) => {
    //     const res = await scanFromURLAsync(pic.uri, ["code128"]);
    //     console.log(res);
    //   },
    // });
    setScanning(true);
  };

  const initProducts = async () => {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    // Query Categories
    const query = await db.getAllAsync("SELECT * FROM categories");
    setCategories(query.map((item) => ({ id: item.id, name: item.name })));

    // Query Products
    const query2 = await db.getAllAsync("SELECT * FROM products");
    setProducts(query2);

    await db.closeAsync();
  };

  const filteredProduct = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search is not null or
  const data =
    filteredProduct && activeCategory
      ? filteredProduct.filter((item) => activeCategory === item.category_id)
      : filteredProduct && !activeCategory
      ? filteredProduct
      : products;

  // Icons
  const BarcodeIcon = () => (
    <Image
      style={styles.icon}
      source={require("@/assets/images/gen_icons/barcode_icon.png")}
    />
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (scannerUsed) {
    return (
      <View style={styles.containerCamera}>
        <CameraView
          style={{
            height: 150,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          facing="back"
          ref={cameraRef}
          barcodeScannerSettings={{
            barcodeTypes: ["code128"],
          }}
          onBarcodeScanned={
            scanning
              ? (res) => {
                  playBarcodeScanSound();
                  console.log(res.data);
                  const prod = products.find(
                    (prod) => prod.barcode_id == res.data
                  );
                  if (prod != null) {
                    router.navigate({
                      params: { id: prod.id },
                      pathname: "inventory/detail",
                    });
                  }
                  setScanning(false);
                }
              : () => {}
          }
        >
          <View></View>
        </CameraView>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
            gap: 10,
          }}
        >
          <Button
            style={{ width: 200 }}
            onPress={handleScan}
            disabled={scanning}
          >
            {scanning ? "Scanning..." : "Scan"}
          </Button>
          <Button
            style={{ width: 100 }}
            onPress={() => {
              setScannerUsed(false);
            }}
          >
            Cancel
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <TextInput
            style={styles.search}
            placeholder="Search"
            value={search}
            onChangeText={onChangeSearch}
          />
          <Button
            onPress={() => {
              setScannerUsed(true);
            }}
            accessoryRight={BarcodeIcon}
            style={styles.refreshButton}
          />
        </View>
        <ScrollView style={styles.categoryList} horizontal={true}>
          {categories.map((category) => (
            <Category
              key={category.id}
              categoryId={category.id}
              title={category.name}
              onPress={setActiveCategory}
              activeCategory={activeCategory}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <Card
              key={item.name}
              id={item.id}
              label={item.name}
              stock={item.stock}
              imgUri={item.img_uri}
            />
          )}
          keyExtractor={(item) => item.name}
          horizontal={false}
          numColumns={2}
          columnWrapperStyle={{ marginBottom: 10 }}
        />
      </View>
      <Link href="inventory/addProduct" asChild>
        <Button
          style={styles.floatingButton}
          size="giant"
          children={() => (
            <Text style={{ fontSize: 22, color: "white" }}>+</Text>
          )}
        ></Button>
      </Link>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
    padding: 10,
  },
  containerCamera: {
    flex: 1,
    justifyContent: "center",
  },
  categoryList: {
    marginTop: 10,
    gap: 25,
  },
  floatingButton: {
    position: "absolute",
    borderRadius: 30,
    width: 50,
    bottom: 25,
    right: 25,
  },
  headerContainer: {
    marginHorizontal: 10,
  },
  search: {
    height: 45,
    width: 250,
    marginTop: 6,
    backgroundColor: "#D5D5D5",
    padding: 14,
    borderRadius: 12,
  },
  icon: {
    width: 32,
    height: 32,
  },
  refreshButton: {
    paddingVertical: 0,
  },
});
