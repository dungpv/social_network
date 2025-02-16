import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import validationMiddleware from "@core/middleware/validation.middleware";
import { Router } from "express";
import RegisterDto from "./dtos/register.dto";
import UsersController from "./users.controller";

export default class UserRoute implements Route {
  public path = "/api/v1/users";
  public router = Router();

  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      validationMiddleware(RegisterDto, true),
      this.usersController.register
    ); //POST: http://localhost:5000/api/users

    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationMiddleware(RegisterDto, true),
      this.usersController.updateUser
    );

    this.router.get(this.path + "/:id", this.usersController.getUserById);
    this.router.get(this.path, this.usersController.getAll);
    this.router.get(
      this.path + "/paging/:page/",
      this.usersController.getAllPaging
    );
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.usersController.deleteUser
    );
  }
}
