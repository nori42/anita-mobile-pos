import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import { useState, useCallback } from "react";
import {
  useLocalSearchParams,
  useFocusEffect,
  Link,
  router,
} from "expo-router";
import uuid from "react-native-uuid";
import { Button, Icon } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { default as theme } from "@/constants/theme.json";
import Loader from "@/components/Loader";
export default function Receipt() {
  const [receipt, setReceipt] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useLocalSearchParams();
  //
  console.log(receipt);
  // When page is visit load the products
  useFocusEffect(
    useCallback(() => {
      console.log("Fetch Receipt");
      initData();

      return () => {
        // Cleanup function
      };
    }, [])
  );

  const initData = async () => {
    const db = await SQLite.openDatabaseAsync(DbConfig.name);

    try {
      //Query Categories
      const queryString = `
              SELECT receipt_id,name,item_price,count,(item_price * count) as items_total,payment_total as "total",payment_received as "received",payment_changed as "change",strftime('%m/%d/%Y %I:%M %p', receipts_item.created_at) as created_at from receipts_item
              INNER JOIN products on products.id = receipts_item.product_id
              INNER JOIN receipts  on receipts.id = receipts_item.receipt_id
              WHERE receipts.id = "${id}"
          `;

      const query = await db.getAllAsync(queryString);
      //   const query = await db.getAllAsync("SELECT * FROM receipts");
      console.log(query);
      setReceipt(() => query);
    } catch (error) {
      console.log(error);
    }

    await db.closeAsync();
  };

  if (loading) {
    return <Loader title="Creating Receipt..." />;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
        <ScrollView style={styles.container}>
          {receipt.length != 0 ? (
            <>
              <View
                style={{
                  marginHorizontal: 20,
                  backgroundColor: "#FFFFFF",
                  padding: 20,
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Image
                    style={{ width: 150, height: 100 }}
                    resizeMode="contain"
                    source={require("@/assets/images/receipt_logo.png")}
                  />
                </View>
                <Text style={{ textAlign: "center", fontSize: 14 }}>
                  ANITA’S HOME BAKESHOP INC.
                </Text>
                <Text style={{ textAlign: "center", fontSize: 12 }}>
                  8 BANAWA CENTRALE, Salvador St Cebu City
                </Text>
                <Text style={{ textAlign: "center", fontSize: 12 }}>
                  VAT Reg TIN: ABN 57 883 865 024
                </Text>

                <View style={{ marginTop: 5 }}>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Icon
                      name="phone-outline"
                      style={[styles.icon, { color: "red" }]}
                    />
                    <Text style={{ fontSize: 12 }}>0919 083 0038</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Icon
                      name="email-outline"
                      style={[styles.icon, { color: "red" }]}
                    />
                    <Text style={{ fontSize: 12 }}>
                      salessup@anitasbakeshop.com
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Icon
                      name="globe-outline"
                      style={[styles.icon, { color: "red" }]}
                    />
                    <Text style={{ fontSize: 12 }}>anitasbakeshop.com</Text>
                  </View>
                </View>

                <View style={{ marginVertical: 10 }}>
                  <Text style={{ fontSize: 11 }}>
                    OR NO# {receipt[0].receipt_id}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    Cashier: Timothy Angelo A. Nahid
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    Date & Time: {receipt[0].created_at}
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: "100%",
                    marginVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: "#aaaa",
                  }}
                />

                {receipt.map((item) => (
                  <View
                    key={uuid.v4()}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>
                      {item.count} {item.name}
                    </Text>
                    <Text>₱{Number(item.items_total).toFixed(2)}</Text>
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
                  <Text>Total:</Text>
                  <Text>₱{Number(receipt[0].total).toFixed(2)}</Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Received:</Text>
                  <Text> ₱{Number(receipt[0].received).toFixed(2)}</Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Changed:</Text>
                  <Text> ₱{Number(receipt[0].change).toFixed(2)}</Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: "100%",
                    marginVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: "#aaaa",
                  }}
                />
                <View style={{ alignItems: "center", gap: 5 }}>
                  <Text style={{ textAlign: "center" }}>
                    How was your experience? Let us know.
                  </Text>
                  <Text style={{ textAlign: "center" }}>
                    feedback.googleforms.com or scan QR code
                  </Text>
                  <Image
                    style={{ width: 70, height: 70 }}
                    resizeMode="cover"
                    source={require("@/assets/images/feedbackqr.png")}
                  />
                </View>
                <Text
                  style={{ textAlign: "center", fontSize: 16, marginTop: 10 }}
                >
                  THANK YOU, PLEASE COME AGAIN
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#aaa",
                    marginTop: 20,
                  }}
                >
                  Screenshot to save the receipt
                </Text>
                <StatusBar style="auto" />
              </View>
              {/* <Link
                push
                href={{
                  pathname: "/(app)/(drawer)/order",
                }}
                asChild={true}
              >
                <Button
                  style={styles.floatingButton}
                  size="giant"
                  onPress={() => {
                    router.back();
                  }}
                  children={() => (
                    <Text style={{ fontSize: 16, color: "white" }}>
                      Back To Order
                    </Text>
                  )}
                ></Button>
              </Link> */}
              <Button
                style={styles.floatingButton}
                size="giant"
                onPress={() => {
                  router.back();
                }}
                children={() => (
                  <Text style={{ fontSize: 16, color: "white" }}>Proceed</Text>
                )}
              ></Button>
            </>
          ) : (
            <></>
          )}
        </ScrollView>
      </ApplicationProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    backgroundColor: "#F6F6F6",
  },
  floatingButton: {
    borderRadius: 20,
    marginTop: 50,
    marginBottom: 30,
    paddingVertical: 0,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
