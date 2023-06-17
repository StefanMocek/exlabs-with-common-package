import * as dotenv from 'dotenv';
dotenv.config();

import express, {Application, Request, Response} from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import mongoose from 'mongoose';
import YAML from 'yamljs';
import swaggerUI from 'swagger-ui-express';

//routers
import {authRouter} from './auth/auth.routes';
import {usersRouter} from './users/users.routes';
import {currentUser, errorHandler, handleNotFound, DatabaseConnectionError} from '@exlabs-recruitment-task-sm-common/coomon/build';

const PORT = process.env.PORT || 3000;

export class AppModule {
  constructor(public app: Application, private dbUri: string, private swwagerDocPath: string) {
    //basic settings
    app.set('trust proxy', true);
    app.use(cors({
      credentials: true,
      origin: process.env.CLIENT_ORIGIN || '*',
      optionsSuccessStatus: 200
    }))
    app.use(express.urlencoded({extended: false}));
    app.use(express.json());
    app.use(cookieSession({
      signed: false,
      secure: false
    }));
  };

  async start() {
    //check if JWT_KEY is present if not app wont start
    if (!process.env.JWT_KEY) {
      throw new Error('JWT_KEY is required')
    };

    try {
      await mongoose.connect(this.dbUri)
    } catch (error) {
      //if dbUri is not provided app wont start
      throw new DatabaseConnectionError()
    };

    // read from /dist/src/module.js 
    const swaggerDoc = YAML.load(this.swwagerDocPath);

    this.app.use(currentUser(process.env.JWT_KEY));
    //Welcome page - docs link
    this.app.get('/', (req: Request, res: Response) => {
      res.send('<h1>Exlabs recruitment task by Stefan MOCEK</h1><a href="/api-docs">Documentation</a>');
    });
    //  docs route
    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

    //main routers
    this.app.use('/api/auth', authRouter);
    this.app.use('/api', usersRouter)

    //handle non-existent url
    this.app.use(handleNotFound);
    //error handler
    this.app.use(errorHandler);

    this.app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  };
};