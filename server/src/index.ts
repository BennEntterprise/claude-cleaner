import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes/scan.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
