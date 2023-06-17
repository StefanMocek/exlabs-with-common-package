import path from "path";
import express from "express";
import {AppModule} from "./app.module";
import {JwtPayload} from '@exlabs-recruitment-task-sm-common/coomon/build';

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtPayload;
    }
  }
};

const swaggerDocPath = path.join(__dirname, '../../swagger.yaml')

const boostrap = async () => {
  //check if JWT_KEY is present if not app wont start
  //real mongo DB will be connected here for tests purpose
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is require')
  };
  const app = new AppModule(express(), process.env.MONGO_URL, swaggerDocPath);
  await app.start();
};

boostrap();