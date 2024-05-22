import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { default as theme } from "@/constants/theme.json";
import { SQLiteProvider } from "expo-sqlite";
import DbConfig from "@/constants/DbConfig";

export default function Providers({ children }) {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
        <SQLiteProvider
          databaseName={DbConfig.name}
          assetSource={{ assetId: DbConfig.source }}
        >
          {children}
        </SQLiteProvider>
      </ApplicationProvider>
    </>
  );
}
