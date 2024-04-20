import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import UserController from "./controller";
import { upload } from "./middlewares/multer";

class App {
  private app: Application;
  private controllers: UserController;

  constructor() {
    this.app = express();
    this.controllers = new UserController();
    this.config();
    this.routes();
    this.errorHandler();
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static("public"));
  }

  private routes(): void {
    this.app.get("/", (req, res) => {
      res.send("Hello from docker hub!");
    });

    this.app.post("/", upload.single("file"), (req, res) => {
      console.log(req.file);
    });

    this.app.post(
      "/user",
      upload.single("file"),
      this.controllers.createUser.bind(this.controllers)
    ); // Bind the context to the method
    this.app.get("/user", this.controllers.getUser.bind(this.controllers)); // Bind the context to the method
    this.app.get("/users", this.controllers.getUsers.bind(this.controllers)); // Bind the context to the method
  }

  private errorHandler(): void {
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(error);
        res.status(400).json({ error: error.message });
      }
    );
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

export default App;
