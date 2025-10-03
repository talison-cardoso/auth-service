import { Router } from "express";
import { CreateUser } from "@/application/usecases/CreateUserUseCase";
import { BcryptHasher } from "../../cryptography/BcryptHasher";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository";
import { CreateUserController } from "../controllers/CreateUserController";

const router = Router();

const userRepository = new PrismaUserRepository();
const bcryptHasher = new BcryptHasher();

const createUserUseCase = new CreateUser(userRepository, bcryptHasher);

const createUserController = new CreateUserController(createUserUseCase);

router.post("/", createUserController.getHandler());

export default router;
