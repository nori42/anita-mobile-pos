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
  Modal,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button, Icon, Input } from "@ui-kitten/components";
import Card from "@/components/order/Card";
import Category from "@/components/inventory/Category";
import { useFocusEffect, router } from "expo-router";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";
import Loader from "@/components/Loader";
import Colors from "@/constants/Colors";

export default function Inventory() {
  const [search, onChangeSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerUsed, setScannerUsed] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [barcodeSound, setBarCodeSound] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [receiptId, setReceiptId] = useState(null);
  const [payment, setPayment] = useState(0);
  const [receipt, setReceipt] = useState({
    receiptId: null,
    paymentReceived: 0,
    paymentChanged: 0,
    paymentTotal: 0,
    itemCount: 0,
  });
  const [processOrder, setProcessOrder] = useState(false);
  // order Format
  // {
  //   productId:null,
  //   receiptId:null,
  //   count:null,
  //   itemPrice:null
  // }

  // Camera Reference
  const cameraRef = useRef();

  //getTotal
  // function ordersCalculation() {
  //   let paymentTotal = 0;
  //   const paymentReceived = receipt.paymentReceived;
  //   let paymentChanged = 0;
  //   let itemCount = 0;

  //   if (orders.length != 0) {
  //     orders.forEach((order) => {
  //       paymentTotal += order.count * order.itemPrice;
  //       itemCount += order.count;
  //     });
  //   }

  //   paymentChanged = paymentReceived - paymentTotal;

  //   return { paymentTotal, paymentReceived, paymentChanged, itemCount };
  // }

  // Handle Orders Change
  useEffect(() => {
    let paymentTotal = 0;
    const paymentReceived = receipt.paymentReceived;
    let paymentChanged = 0;
    let itemCount = 0;

    if (orders.length != 0) {
      orders.forEach((order) => {
        paymentTotal += order.count * order.itemPrice;
        itemCount += order.count;
      });
    }

    paymentChanged = paymentReceived - receipt.paymentTotal;

    setReceipt((prev) => ({
      ...prev,
      ...{
        receiptId,
        paymentTotal,
        paymentReceived,
        paymentChanged,
        itemCount,
      },
    }));
  }, [orders]);

  useEffect(() => {
    setReceipt((prev) => ({
      ...prev,
      ...{
        paymentReceived: payment,
        paymentChanged: payment - receipt.paymentTotal,
      },
    }));
  }, [payment]);

  // When page is visit load the products
  useFocusEffect(
    useCallback(() => {
      console.log("Fetch Products");
      initProducts();
      setReceiptId(uuid.v4());
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

  // Process Scanned Item

  const handleScannedItem = (res) => {
    playBarcodeScanSound();
    const scanProd = products.find((prod) => prod.barcode_id == res.data);
    // setOrders((prev) => {
    //   const prevOrders = [...prev];
    //   // Check if product exist already in the list if is just increment count
    //   if (prevOrders.find((item) => item.productId == scanProd.id)) {
    //     // Create a copy of the original array
    //     const updatedOrders = [...orders];
    //     // Find the index of the item with the given id
    //     const index = updatedOrders.findIndex(
    //       (order) => order.productId == scanProd.id
    //     );
    //     // If the item is found, update it
    //     updatedOrders[index] = {
    //       ...updatedOrders[index],
    //       ...{ count: updatedOrders[index].count + 1 },
    //     };
    //     return updatedOrders;
    //   } else {
    //     return [
    //       ...prev,
    //       {
    //         name: scanProd.name,
    //         productId: scanProd.id,
    //         receiptId: receiptId,
    //         count: 1,
    //         itemPrice: scanProd.price,
    //       },
    //     ];
    //   }
    // });

    setProducts((prev) => {
      return prev.map((prod) => {
        if (prod.id == scanProd.id && prod.stock != 0) {
          setOrders((prev) => {
            const prevOrders = [...prev];
            // Check if product exist already in the list if is just increment count
            if (prevOrders.find((item) => item.productId == scanProd.id)) {
              // Create a copy of the original array
              const updatedOrders = [...orders];
              // Find the index of the item with the given id
              const index = updatedOrders.findIndex(
                (order) => order.productId == scanProd.id
              );
              // If the item is found, update it
              updatedOrders[index] = {
                ...updatedOrders[index],
                ...{ count: updatedOrders[index].count + 1 },
              };
              return updatedOrders;
            } else {
              return [
                ...prev,
                {
                  name: scanProd.name,
                  productId: scanProd.id,
                  receiptId: receiptId,
                  count: 1,
                  itemPrice: scanProd.price,
                },
              ];
            }
          });
          return { ...prod, stock: prod.stock - 1 };
        } else {
          return prod;
        }
      });
    });
    setScanning(false);
    // ToastAndroid.show("Item Added to the orders!", ToastAndroid.SHORT);
  };

  // Handle Product Pressed
  const handleItemPress = (id) => {
    const scanProd = products.find((prod) => prod.id == id);

    setProducts((prev) => {
      return prev.map((prod) => {
        if (prod.id == id && prod.stock != 0) {
          setOrders((prev) => {
            const prevOrders = [...prev];
            // Check if product exist already in the list if is just increment count
            if (prevOrders.find((item) => item.productId == scanProd.id)) {
              // Create a copy of the original array
              const updatedOrders = [...orders];
              // Find the index of the item with the given id
              const index = updatedOrders.findIndex(
                (order) => order.productId == scanProd.id
              );
              // If the item is found, update it
              updatedOrders[index] = {
                ...updatedOrders[index],
                ...{ count: updatedOrders[index].count + 1 },
              };
              return updatedOrders;
            } else {
              return [
                ...prev,
                {
                  name: scanProd.name,
                  productId: scanProd.id,
                  receiptId: receiptId,
                  count: 1,
                  itemPrice: scanProd.price,
                },
              ];
            }
          });
          return { ...prod, stock: prod.stock - 1 };
        } else {
          return prod;
        }
      });
    });

    // ToastAndroid.show(
    //   `${scanProd.name} Added to the orders!`
    //   // ToastAndroid.SHORT
    // );
  };

  // Handle Scan
  const handleScan = async () => {
    setScanning(true);
  };

  // Initialize Product
  const initProducts = async () => {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    // Query Categories
    const query = await db.getAllAsync("SELECT * FROM categories");
    setCategories(query.map((item) => ({ id: item.id, name: item.name })));

    // Query Products
    const query2 = await db.getAllAsync("SELECT * FROM products");
    setProducts(query2);
    setCurrentProducts(query2);

    await db.closeAsync();
  };

  // Handle Submit
  const handleSubmitOrder = async ({ _receipt, _orders }) => {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    // Receipt
    const receiptsInsertStatement = await db.prepareAsync(
      "INSERT INTO receipts (id,payment_received,payment_changed,payment_total,item_count) values ($id,$payment_received,$payment_changed,$payment_total,$item_count)"
    );
    try {
      let result = await receiptsInsertStatement.executeAsync({
        $id: _receipt.receiptId,
        $payment_received: Number(_receipt.paymentReceived),
        $payment_changed: Number(_receipt.paymentChanged),
        $payment_total: Number(_receipt.paymentTotal),
        $item_count: Number(_receipt.itemCount),
      });
      console.log("Receipt Inserted: ", result.lastInsertRowId, result.changes);
      console.log("Receipt ID: ", _receipt.receiptId);
    } catch (error) {
      console.log(error);
    } finally {
      await receiptsInsertStatement.finalizeAsync();
    }

    // Receipt Items
    const receiptsItemInsertStatement = await db.prepareAsync(
      "INSERT INTO receipts_item (product_id,receipt_id, count,item_price) values ($product_id,$receipt_id,$count,$item_price)"
    );
    try {
      _orders.forEach(async (order) => {
        let result = await receiptsItemInsertStatement.executeAsync({
          $product_id: Number(order.productId),
          $receipt_id: order.receiptId,
          $count: Number(order.count),
          $item_price: Number(order.itemPrice),
        });

        console.log(
          "Receipt Item Inserted: ",
          result.lastInsertRowId,
          result.changes
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      await receiptsItemInsertStatement.finalizeAsync();
    }

    // Update product stock
    console.log(_orders);
    try {
      for (const order of _orders) {
        const queryProduct = await db.getFirstAsync(
          `SELECT * FROM products WHERE id = ${order.productId}`
        );

        if (queryProduct) {
          const result = await db.runAsync(
            "UPDATE products SET stock = ? WHERE id = ?",
            [queryProduct.stock - order.count, order.productId]
          );
          console.log("Product Stock Updated: ", result.changes);
        } else {
          console.log(`Product with id ${order.productId} not found`);
        }
      }
    } catch (error) {
      console.error("Error updating product stock:", error);
    }

    await db.closeAsync();
  };

  const handleResetOrder = () => {
    const receiptId = uuid.v4();
    setOrders([]);
    setReceiptId(receiptId);
    setReceipt({
      receiptId: receiptId,
      paymentReceived: 0,
      paymentChanged: 0,
      paymentTotal: 0,
      itemCount: 0,
    });
    setPayment(0);
    setProducts(currentProducts);
  };

  const orderCriteria = () => {
    return (
      Number(receipt.paymentChanged) < 0 || payment == "" || orders.length == 0
    );
  };
  // Handle Database Submit
  useEffect(() => {
    if (processOrder) {
      (async function insertData() {
        await handleSubmitOrder({
          _receipt: { ...receipt },
          _orders: orders,
        });
        setProcessOrder(false);
        handleResetOrder();

        router.push({
          pathname: "/(app)/orders/receipt",
          params: { id: receipt.receiptId },
        });
      })();
    }
  }, [processOrder]);

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

  const filteredNoStock = data.filter((item) => item.stock != 0);

  // Icons
  const BarcodeIcon = () => (
    <Image
      style={styles.icon}
      source={require("@/assets/images/gen_icons/barcode_icon.png")}
    />
  );

  const ShoppingCartIcon = () => (
    <Icon style={styles.icon} fill="#FFF" name="shopping-cart-outline" />
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
        <Button onPress={requestPermission}>Allow Camera</Button>
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
          onBarcodeScanned={scanning ? handleScannedItem : () => {}}
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
  console.log(orders.length);
  return (
    <>
      {processOrder ? (
        <Loader title="Processing..." />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Modal
              animationType="fade"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={{ width: "100%" }}>
                    {orders.map((order) => (
                      <View
                        key={uuid.v4()}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>
                          {order.count} {order.name}
                        </Text>
                        <Text>
                          ₱{String((order.count * order.itemPrice).toFixed(2))}
                        </Text>
                      </View>
                    ))}

                    {/* Divider */}
                    <View
                      style={{
                        width: "100%",
                        marginVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: "#aaaa",
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Total</Text>
                      <Text>₱{receipt.paymentTotal.toFixed(2)}</Text>
                    </View>

                    {receipt.paymentReceived > 0 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>Change</Text>
                        <Text>₱{receipt.paymentChanged.toFixed(2)}</Text>
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                  {orders.length > 0 ? (
                    <Input
                      label="Payment"
                      color="#000"
                      {...{ inputMode: "decimal" }}
                      onChangeText={(value) => {
                        setPayment(value);
                        setReceipt((prev) => ({
                          ...prev,
                          ...{ paymentReceived: value },
                        }));
                      }}
                      value={payment}
                    />
                  ) : (
                    <></>
                  )}
                  <Button
                    style={{ marginTop: 10, width: "100%" }}
                    onPress={() => {
                      setProcessOrder(true);
                      setModalVisible(false);
                    }}
                    disabled={orderCriteria()}
                  >
                    Confirm Order
                  </Button>
                  <Button
                    style={{ marginTop: 10, width: "100%" }}
                    size="small"
                    onPress={handleResetOrder}
                  >
                    Reset Order
                  </Button>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
              data={filteredNoStock}
              renderItem={({ item }) => (
                <Card
                  key={item.name}
                  id={item.id}
                  price={item.price}
                  label={item.name}
                  stock={item.stock}
                  imgUri={item.img_uri}
                  product={{
                    id: item.id,
                    price: item.price,
                    label: item.name,
                    stock: item.stock,
                    imgUri: item.img_uri,
                  }}
                  onPress={handleItemPress}
                />
              )}
              keyExtractor={(item) => item.name}
              horizontal={false}
              numColumns={2}
              columnWrapperStyle={{ marginBottom: 10 }}
            />
          </View>
          <Button
            style={styles.floatingButton}
            onPress={() => {
              setModalVisible(true);
            }}
            accessoryRight={ShoppingCartIcon}
            size="giant"
            children={() => (
              <View>
                <Text style={{ fontSize: 16, color: "white" }}>
                  Process Order
                </Text>
                <Text
                  style={{
                    position: "absolute",
                    left: -60,
                    top: -10,
                    color: "#fff",
                    backgroundColor: Colors.light.primary,
                    padding: 10,
                    borderRadius: 25,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {orders.reduce((sum, item) => sum + item.count, 0)}
                </Text>
              </View>
            )}
          ></Button>
          <StatusBar style="auto" />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
    padding: 10,
    paddingBottom: 60,
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
    borderRadius: 20,
    paddingVertical: 0,
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
