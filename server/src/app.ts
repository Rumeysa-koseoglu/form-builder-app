import express from "express";
import authRoutes from "./routes/auth.js";
import formRoutes from "./routes/forms.js";
import publicRoutes from "./routes/public.js";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://form-builder-app-1-h6qc.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/public", publicRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

export default app;
