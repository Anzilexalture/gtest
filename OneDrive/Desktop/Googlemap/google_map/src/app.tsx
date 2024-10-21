import { SearchableListView } from "@canva/app-components";
import { Box } from "@canva/app-ui-kit";
import { findResources } from "./adapter";
import { config } from "./config";
import * as styles from "./index.css";
import "@canva/app-ui-kit/styles.css";

export function App() {
  return (
    <Box className={styles.rootWrapper}>
      <SearchableListView config={config} findResources={findResources} />
    </Box>
  );
}
