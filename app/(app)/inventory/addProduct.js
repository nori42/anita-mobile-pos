import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, ToastAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Text,
  Spinner,
} from "@ui-kitten/components";
import imagePlaceholder from "@/assets/images/image_placeholder.png";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import { router, useFocusEffect } from "expo-router";
import BarCode from "@/components/BarCode";
import hash from "hash-it";
import * as FileSystem from "expo-file-system";
import Variables from "@/constants/Variables";
import Loader from "@/components/Loader";

export default function AddProduct() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [inputError, setInputError] = useState([]);
  const [selectedImage, setSelectedImage] = useState(imagePlaceholder);
  const [categories, setCategories] = useState([]);
  const [barCodeValue, setBarCodeValue] = useState("");
  const [product, setProduct] = useState({
    name: null,
    price: null,
    stock: null,
    categoryId: null,
    description: null,
    barCodeId: null,
    imgUri: null,
  });
  const [loading, setLoading] = useState(false);

  // Hooks

  // Load Categories
  useFocusEffect(
    useCallback(() => {
      console.log("Fetch Categories");
      getCategories();
    }, [])
  );

  async function getCategories() {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    const query = await db.getAllAsync("SELECT * FROM categories");
    setCategories(query.map((item) => ({ id: item.id, name: item.name })));
  }

  // Image Picker
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProduct((prev) => ({ ...prev, imgUri: result.assets[0].uri }));
    } else {
      console.log("You did not select any image.");
    }
  };

  // Validate Input
  const validateInput = () => {
    let inputInvalid = [];
    for (const property in product) {
      if (product[property] === null) {
        inputInvalid.push(
          property.charAt(0).toUpperCase() +
            property.slice(1) +
            " Must Not Be Empty"
        );
      }
    }

    if (inputInvalid.length != 0) {
      setInputError(inputInvalid);
      return false;
    }

    return true;
  };

  // Hande Input Change
  const handleInputChange = (key, value) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  // Sqlite
  async function insertProduct({
    name,
    price,
    stock,
    categoryId,
    description,
    barCodeId,
    imgUri,
  }) {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    const statement = await db.prepareAsync(
      "INSERT INTO products (name, price, stock, category_id, description, barcode_id,img_uri) VALUES ($name, $price, $stock, $category_id, $description, $barcode_id,$img_uri)"
    );
    try {
      imgPath = await Variables.saveImage(imgUri);
      const result = await statement.executeAsync({
        $name: name,
        $price: price,
        $stock: stock,
        $category_id: categoryId,
        $description: description,
        $barcode_id: barCodeId,
        $img_uri: imgPath,
      });
      console.log("Product Inserted: ", result.lastInsertRowId, result.changes);
    } catch (error) {
      console.log(error);
    } finally {
      await statement.finalizeAsync();
    }
  }
  // Handle Submit
  const handleSubmit = async () => {
    if (validateInput()) {
      setLoading(true);
    }
  };

  // Insert Database when loading changes
  useEffect(() => {
    (async () => {
      if (loading) {
        await insertProduct(product);
        setLoading(false);
        setSelectedIndex(null);

        router.replace("/(app)/(drawer)/inventory");
      }
    })();
  }, [loading]);

  // Handle barcode generate
  const handleBarcodeGenerate = () => {
    const barcodes = hash(product.name).toString();
    setProduct((prev) => ({ ...prev, barCodeId: barcodes }));
    setBarCodeValue(barcodes);
  };

  return loading ? (
    <Loader title="Adding Product" />
  ) : (
    <View style={styles.container}>
      <View>
        {inputError.map((error) => (
          <Text
            style={{ color: "red" }}
            key={Math.floor(Math.random() * 100 + 100)}
          >
            {error}
          </Text>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Show barcode if there is barcode value */}
        {barCodeValue != null && barCodeValue != "" ? (
          <View>
            <Text style={{ paddingLeft: 10 }}>Bar Code ID: {barCodeValue}</Text>
            <BarCode value={barCodeValue} />
          </View>
        ) : null}

        {product.name != null && product.name != "" ? (
          <Button
            style={{ marginTop: 10 }}
            size="medium"
            onPress={handleBarcodeGenerate}
          >
            Add Barcode ID
          </Button>
        ) : null}
        <Input
          label="Name"
          color="#000"
          onChangeText={(value) => {
            handleInputChange("name", value);
          }}
        />

        <Input
          label="Price"
          color="#000"
          {...{ inputMode: "decimal" }}
          onChangeText={(value) => {
            handleInputChange("price", value);
          }}
        />
        <Select
          style={{ width: "100%" }}
          onSelect={(index) => {
            setSelectedIndex(index);
            setProduct((prev) => ({ ...prev, categoryId: Number(index) }));
          }}
          placeholder="Select Category"
          value={selectedIndex ? categories[selectedIndex.row].name : null}
          label="Category"
          children={categories.map((category) => (
            <SelectItem
              key={category.id}
              title={category.name}
              value={category.id}
            />
          ))}
        ></Select>
        <Input
          label="Stock"
          color="#000"
          {...{ inputMode: "numeric" }}
          onChangeText={(value) => {
            handleInputChange("stock", Number(value));
          }}
        />
        <Input
          label="Description"
          color="#000"
          {...{ multiline: true, rows: 4 }}
          onChangeText={(value) => {
            handleInputChange("description", value);
          }}
        />
        <Image
          style={styles.image}
          source={selectedImage}
          contentFit="cover"
          transition={1000}
          placeholder={imagePlaceholder}
          placeholderContentFit="cover"
        />

        <Button
          onPress={pickImageAsync}
          style={{ marginTop: 32, width: "100%" }}
          size="small"
        >
          Upload Photo
        </Button>
        <Button style={{ marginTop: 10, width: "100%" }} onPress={handleSubmit}>
          Add Product
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  image: {
    height: 150,
    width: 250,
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    alignItems: "center",
  },
});
