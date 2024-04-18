import cors from "cors";
import express, { Application } from "express";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from docker!");
});
export default app;
