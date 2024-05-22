import { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, ScrollView, ToastAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  Text,
  Input,
  Button,
  IndexPath,
  Select,
  SelectItem,
} from "@ui-kitten/components";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import imagePlaceholder from "@/assets/images/image_placeholder.png";
import DbConfig from "@/constants/DbConfig";
import * as SQLite from "expo-sqlite";
import Loader from "@/components/Loader";
import Variables from "@/constants/Variables";

export default function EditProduct() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputError, setInputError] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    id: null,
    name: null,
    price: null,
    stock: null,
    categoryId: null,
    description: null,
    barCodeId: null,
    imgUri: null,
  });
  const [loading, setLoading] = useState(false);

  const { id } = useLocalSearchParams();

  console.log(product);

  // Load Categories
  useFocusEffect(
    useCallback(() => {
      console.log("Fetch Categories");
      getData();
    }, [])
  );

  const getData = async () => {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    const query = await db.getAllAsync("SELECT * FROM categories");
    setCategories(query.map((item) => ({ id: item.id, name: item.name })));

    const query2 = await db.getFirstAsync(
      `SELECT * FROM products WHERE products.id = ${id}`
    );

    setProduct((prev) => ({
      ...prev,
      ...{
        id: query2.id,
        name: query2.name,
        price: query2.price,
        stock: query2.stock,
        categoryId: query2.category_id,
        description: query2.description,
        barCodeId: query2.barcode_id,
        imgUri: query2.img_uri,
      },
    }));
    setSelectedImage(query2.img_uri);
    setSelectedIndex(new IndexPath(Number(query2.category_id) - 1));
  };
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
        if (property != "imgUri" && property != "barCodeId")
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
  async function updateProduct({
    id,
    name,
    price,
    stock,
    categoryId,
    description,
    imgUri,
  }) {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    try {
      imgPath = await Variables.saveImage(imgUri);

      const result = await db.runAsync(
        "UPDATE products SET name = ?,price = ?, stock = ?, category_id = ?,description = ?, img_uri = ? WHERE id = ?",
        [name, price, stock, categoryId, description, imgPath, id]
      );
      console.log("Product Edited: ", result.changes);
    } catch (error) {
      console.log(error);
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
        await updateProduct(product);
        setLoading(false);
        setSelectedIndex(null);

        router.replace("/(app)/(drawer)/inventory");
      }
    })();
  }, [loading]);

  if (product.id == null) return <Loader title="Fetching..." />;

  return loading ? (
    <Loader title="Updating" />
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
        <Input
          label="Name"
          color="#000"
          onChangeText={(value) => {
            handleInputChange("name", value);
          }}
          value={product.name}
        />

        <Input
          label="Price"
          color="#000"
          {...{ inputMode: "decimal" }}
          onChangeText={(value) => {
            handleInputChange("price", value);
          }}
          value={String(product.price)}
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
          value={String(product.stock)}
        />
        <Input
          label="Description"
          color="#000"
          {...{ multiline: true, rows: 4 }}
          onChangeText={(value) => {
            handleInputChange("description", value);
          }}
          value={product.description}
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
          Update Product
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
