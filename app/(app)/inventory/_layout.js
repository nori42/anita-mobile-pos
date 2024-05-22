import { Stack, Link } from "expo-router";
import { Button } from "react-native";
import Colors from "@/constants/Colors";
import Providers from "@/components/Providers";
export default function Layout() {
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="addProduct"
          getId={({ params }) => String(Date.now())}
          options={{ freezeOnBlur: true, title: "Add Product" }}
        />
        <Stack.Screen name="editProduct" options={{ title: "Edit Product" }} />
        <Stack.Screen name="detail" options={{ title: "Product Detail" }} />
      </Stack>
    </Providers>
  );
}
