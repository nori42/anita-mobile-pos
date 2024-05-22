import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Image, View } from "react-native";
import drawerNav from "@/constants/DrawerNav";
import Colors from "@/constants/Colors";
import Providers from "@/components/Providers";
import uuid from "react-native-uuid";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Text } from "@ui-kitten/components";

function customDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Image
          style={{ height: 90, width: 150 }}
          source={require("@/assets/images/logo.png")}
        />
      </View>
      <View
        style={{
          width: "100%",
          borderBottomWidth: 1,
          borderColor: "#ccc",
        }}
      />
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

export default function Layout() {
  return (
    <Providers>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer drawerContent={customDrawerContent}>
          <Drawer.Screen
            name="order"
            getId={() => String(Date.now())}
            options={{
              // unmountOnBlur: true,
              drawerLabel: "Order",
              title: "Order",
              headerTintColor: Colors.light.textWhite,
              headerStyle: {
                backgroundColor: Colors.light.primary,
              },
              drawerStyle: { backgroundColor: Colors.light.primary },
              drawerItemStyle: { backgroundColor: Colors.light.primary },
              drawerLabelStyle: { color: Colors.light.textWhite },
              drawerIcon: () => (
                <Image
                  source={require("@/assets/images/nav_icons/order.png")}
                  height={25}
                  width={25}
                />
              ),
            }}
          />

          <Drawer.Screen
            name="inventory"
            getId={() => String(Date.now())}
            options={{
              unmountOnBlur: true,
              drawerLabel: "Inventory",
              title: "Inventory",
              headerTintColor: Colors.light.textWhite,
              headerStyle: {
                backgroundColor: Colors.light.primary,
              },
              drawerStyle: { backgroundColor: Colors.light.primary },
              drawerItemStyle: { backgroundColor: Colors.light.primary },
              drawerLabelStyle: { color: Colors.light.textWhite },
              drawerIcon: () => (
                <Image
                  source={require("@/assets/images/nav_icons/inventory.png")}
                  height={25}
                  width={25}
                />
              ),
            }}
          />

          <Drawer.Screen
            name="reports"
            getId={() => String(Date.now())}
            options={{
              // unmountOnBlur: true,
              drawerLabel: "Reports",
              title: "Reports",
              headerTintColor: Colors.light.textWhite,
              headerStyle: {
                backgroundColor: Colors.light.primary,
              },
              drawerStyle: { backgroundColor: Colors.light.primary },
              drawerItemStyle: { backgroundColor: Colors.light.primary },
              drawerLabelStyle: { color: Colors.light.textWhite },
              drawerIcon: () => (
                <Image
                  source={require("@/assets/images/nav_icons/reports.png")}
                  height={25}
                  width={25}
                />
              ),
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </Providers>
  );
}
