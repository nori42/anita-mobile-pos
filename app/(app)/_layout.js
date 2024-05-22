import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="(stack)" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
