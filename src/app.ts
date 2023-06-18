import path from "path";
import express from "express";
import { AppModule } from "./app.module";
import { JwtPayload } from "@exlabs-recruitment-task-sm-common/coomon/build";

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtPayload;
    }
  }
}

const PORT = process.env.PORT || 3000;
const swaggerDocPath = path.join(__dirname, "../../swagger.yaml");

const bootstrap = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  const app = new AppModule(express(), process.env.MONGO_URL, swaggerDocPath);
  await app.start();

  app.app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

bootstrap();
