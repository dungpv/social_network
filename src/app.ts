import { Logger } from "@core/utils";
import { Route } from "@core/interfaces";
import cors from "cors";
import { errorMiddleware } from "@core/middleware";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import morgan from "morgan";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == "production" ? true : false;

    this.connectToDatabase();
    this.initializeMiddleware();
    this.initializerRoutes(routes);
    this.initializeErrorMiddleware();
    this.initializeSwagger();
  }
  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }
  private initializerRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeMiddleware() {
    if (this.production) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(cors({ origin: "your.domain.com", credentials: true }));
    } else {
      this.app.use(morgan("dev"));
      this.app.use(cors({ origin: true, credentials: true }));
    }
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
  private initializeErrorMiddleware() {
    this.app.use(errorMiddleware);
  }
  private connectToDatabase() {
    const connectString = process.env.MONGODB_URI;
    if (!connectString) {
      Logger.error("Connection string is invalid");
      return;
    }
    //const connectString = 'mongodb+srv://dungpv:123456a@@master.jw6k2.mongodb.net/dungpv_social?retryWrites=true&w=majority';
    mongoose
      .connect(connectString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      })
      .catch((reason) => {
        Logger.error(reason);
      });
    Logger.info("Database connected...");
  }

  private initializeSwagger() {
    const swaggerDocument = YAML.load("./src/swagger.yaml");

    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}

export default App;
