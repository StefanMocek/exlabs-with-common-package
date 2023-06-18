import * as dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import mongoose from "mongoose";
import YAML from "yamljs";
import swaggerUI from "swagger-ui-express";

// Routers
import { authRouter } from "./auth/auth.routes";
import { usersRouter } from "./users/users.routes";
import {
  currentUser,
  errorHandler,
  handleNotFound,
  DatabaseConnectionError,
} from "@exlabs-recruitment-task-sm-common/coomon/build";

dotenv.config();

export class AppModule {
  constructor(
    public app: Application,
    private dbUri: string,
    private swaggerDocPath?: string
  ) {
    this.configureApp();
  }

  private configureApp() {
    this.app.set("trust proxy", true);
    this.app.use(
      cors({
        credentials: true,
        origin: process.env.CLIENT_ORIGIN || "*",
        optionsSuccessStatus: 200,
      })
    );
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(
      cookieSession({
        signed: false,
        secure: false,
      })
    );
  }

  private async connectToDatabase() {
    if (!this.dbUri) {
      throw new Error("Database URI is required");
    }

    try {
      await mongoose.connect(this.dbUri);
    } catch (error) {
      throw new DatabaseConnectionError();
    }
  }

  private setupSwagger() {
    if (!this.swaggerDocPath) {
      return;
    }

    const swaggerDoc = YAML.load(this.swaggerDocPath);

    this.app.get("/", (req: Request, res: Response) => {
      res.send(
        '<h1>Exlabs recruitment task by Stefan MOCEK</h1><a href="/api-docs">Documentation</a>'
      );
    });

    this.app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  }

  private setupMiddlewares() {
    this.app.use(currentUser(process.env.JWT_KEY!));
  }

  private setupRouters() {
    this.app.use("/api/auth", authRouter);
    this.app.use("/api", usersRouter);
  }

  private setupErrorHandling() {
    this.app.use(handleNotFound);
    this.app.use(errorHandler);
  }

  public async start() {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY is required");
    }

    await this.connectToDatabase();
    this.setupSwagger();
    this.setupMiddlewares();
    this.setupRouters();
    this.setupErrorHandling();
  }
}
