import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`✅ VigiHouse_backend rodando em http://localhost:${config.port}`);
});
