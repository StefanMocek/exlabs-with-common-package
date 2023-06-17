import {NextFunction, Request, Response} from 'express';
import {CustomError} from '@exlabs-recruitment-task-sm-common/coomon/build';
import {usersService} from './users.service';

export class UsersController {
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const {role} = req.query;
    const result = await usersService.getAll(role as string);
    res.status(200).send(result);
  };

  public async getSingleUser(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;
    const result = await usersService.getSingleUser(id);
    if (result instanceof CustomError) {
      return next(result)
    };
    res.status(200).send(result);
  };

  public async addUser(req: Request, res: Response, next: NextFunction) {
    const {firstName, lastName, email, role} = req.body;

    const user = await usersService.createUser({
      firstName,
      lastName,
      email,
      role
    });

    res.status(201).send(user);
  }

  public async updateUser(req: Request, res: Response, next: NextFunction) {
    const {firstName, lastName, role} = req.body;
    const {id: userId} = req.params;

    const result = await usersService.updateUser({
      userId,
      firstName,
      lastName,
      role
    });

    if (result instanceof CustomError) {
      return next(result);
    };

    res.status(200).send(result);
  };

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    const {id: userId} = req.params;

    const result = await usersService.deleteUser({userId});

    if (result instanceof CustomError) {
      return next(result);
    };

    res.status(200).send(true);
  };
};

export default new UsersController();