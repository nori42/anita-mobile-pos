import { View, StyleSheet } from "react-native";
import { Text, Spinner } from "@ui-kitten/components";

export default function Loader({ title = "" }) {
  return (
    <View style={styles.loader}>
      <Text style={{ marginBottom: 20 }} status="primary">
        {title}
      </Text>
      <Spinner size="giant" />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
