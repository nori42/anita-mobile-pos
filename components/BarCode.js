import Barcode from "@adrianso/react-native-barcode-builder";
import { View } from "react-native";

export default function BarCode({
  value,
  barCodeBuilderProps = {},
  barCodeContainerStyle = {},
}) {
  return (
    <View
      style={[{ width: 300, height: 90, margin: 15 }, barCodeContainerStyle]}
    >
      <Barcode value={value} format="CODE128" {...barCodeBuilderProps} />
    </View>
  );
}
