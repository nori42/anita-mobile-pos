import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation, Link } from "expo-router";
import { useCallback, useState } from "react";
import { Button } from "@ui-kitten/components";
import Colors from "@/constants/Colors";
import * as SQLite from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";
import uuid from "react-native-uuid";
import Loader from "@/components/Loader";

export default function Reports() {
  const [activePage, setActivePage] = useState(1);
  const [receipts, setReceipts] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState([]);
  const [totalSold, setTotalSold] = useState(0);
  const [productSales, setProductSales] = useState([]);
  // When page is visit load the products
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const db = await SQLite.openDatabaseAsync(DbConfig.name);

        // Query Receipts
        const query = await db.getAllAsync(
          "SELECT id,payment_total,strftime('%m/%d/%Y %I:%M %p', created_at) as label FROM receipts ORDER BY created_at DESC"
        );

        const queryCategoryCounts = await db.getAllAsync(
          `
            SELECT categories.name,sum(count) as sold_count from receipts_item
          INNER JOIN products on products.id = receipts_item.product_id
          FULL OUTER JOIN categories on categories.id = products.category_id 
          FULL OUTER JOIN receipts  on receipts.id = receipts_item.receipt_id
          GROUP BY categories.name 
          `
        );

        const queryProductSales = await db.getAllAsync(
          `
            SELECT name,item_price,sum(count) as items_sold,sum((item_price * count))  as items_total from receipts_item
            INNER JOIN products on products.id = receipts_item.product_id
            INNER JOIN receipts  on receipts.id = receipts_item.receipt_id
            GROUP BY products.name
          `
        );

        const queryTotalSold = await db.getFirstAsync(
          `
            SELECT sum(payment_total) as total_amount_sold, sum(item_count) as item_sold_total FROM receipts 
          `
        );

        console.log(queryProductSales);
        setCategoriesCount(queryCategoryCounts);
        setReceipts(query);
        setTotalSold(queryTotalSold);
        setProductSales(queryProductSales);
        await db.closeAsync();
      })();
      return () => {
        // Cleanup function
      };
    }, [])
  );

  return (
    <>
      <View style={styles.container}>
        {activePage == 1 ? (
          <ReceiptPage prop="Hello" receipts={receipts} />
        ) : (
          <SalesPage
            categoriesCount={categoriesCount}
            totalSold={totalSold}
            productSales={productSales}
          />
        )}
        <StatusBar style="auto" />
      </View>
      <View style={styles.tabContainer}>
        <Button
          style={[
            styles.tabButtons,
            activePage == 1 ? null : styles.tabButtonInactive,
          ]}
          children={() => (
            <Text
              style={{ color: activePage == 1 ? "#fff" : Colors.light.primary }}
            >
              Receipts
            </Text>
          )}
          onPress={() => setActivePage(1)}
        ></Button>
        <Button
          style={[
            styles.tabButtons,
            activePage == 2 ? null : styles.tabButtonInactive,
          ]}
          children={() => (
            <Text
              style={{ color: activePage == 2 ? "#fff" : Colors.light.primary }}
            >
              Sales
            </Text>
          )}
          onPress={() => setActivePage(2)}
        ></Button>
      </View>
    </>
  );
}

function ReceiptPage({ receipts }) {
  return (
    <>
      <View style={{ flex: 1, padding: 25 }}>
        {/*Receipts Page*/}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#666",
            marginBottom: 15,
          }}
        >
          Receipts: {receipts.length}
        </Text>
        <ScrollView>
          {receipts.map((receipt) => (
            <Link
              key={uuid.v4()}
              href={{ params: { id: receipt.id }, pathname: "orders/receipt" }}
              asChild
            >
              <TouchableOpacity>
                <View
                  style={[
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "#eee",
                      padding: 10,
                      paddingHorizontal: 35,
                      marginBottom: 10,
                    },
                    styles.boxShadow,
                  ]}
                >
                  <Text>{receipt.label}</Text>
                  <Text>₱{Number(receipt.payment_total).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

function SalesPage({ categoriesCount, totalSold, productSales }) {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <View>
          <Text
            style={{ marginVertical: 20, fontWeight: "bold", fontSize: 20 }}
          >
            Sales
          </Text>
          <View
            style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}
          >
            {totalSold.item_sold_total != null ? (
              <>
                <InfoBox>
                  <Text style={{ fontWeight: "bold" }}>Total Sold</Text>
                  <Text>{totalSold.item_sold_total}</Text>
                </InfoBox>
                <InfoBox>
                  <Text style={{ fontWeight: "bold" }}>Total Amount</Text>
                  <Text>₱{Number(totalSold.total_amount_sold).toFixed(2)}</Text>
                </InfoBox>
              </>
            ) : (
              <Text>Nothing Sold Yet</Text>
            )}
          </View>
        </View>

        <View>
          <Text
            style={{ marginVertical: 20, fontWeight: "bold", fontSize: 20 }}
          >
            Sold by Product
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {productSales.length != 0 ? (
              productSales.map((prod) => (
                <InfoBox key={uuid.v4()}>
                  <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                    {prod.name}
                  </Text>
                  <Text>{prod.items_sold}</Text>
                  <Text>₱{Number(prod.items_total).toFixed(2)}</Text>
                </InfoBox>
              ))
            ) : (
              <Text>Nothing Sold Yet</Text>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{ marginVertical: 20, fontWeight: "bold", fontSize: 20 }}
          >
            Sold by Category
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {categoriesCount.length != 0 ? (
              categoriesCount.map((category) => (
                <TouchableOpacity
                  key={uuid.v4()}
                  activeOpacity={0.7}
                  style={[
                    {
                      padding: 10,
                      flexBasis: 130,
                      height: 80,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#eee",
                    },
                    styles.boxShadow,
                  ]}
                >
                  <View>
                    <Text style={{ textAlign: "center", fontWeight: "bold" }}>
                      {category.name}
                    </Text>
                    <Text style={{ textAlign: "center" }}>
                      {category.sold_count ?? 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text>Nothing Sold Yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoBox({ children }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        {
          padding: 10,
          flexBasis: 130,
          height: 80,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eee",
        },
        styles.boxShadow,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  tabContainer: {
    height: 60,
    flexDirection: "row",
  },
  tabButtons: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginBottom: 10,
    marginHorizontal: 5,
  },
  tabButtonInactive: {
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
