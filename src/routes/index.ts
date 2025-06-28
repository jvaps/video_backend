import { Router } from "express";
import { StreamController } from "../controllers/stream.controller";

const router = Router();

router.get("/camera/stream", StreamController.stream);

export default router;
