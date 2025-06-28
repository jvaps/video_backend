import { Request, Response } from "express";
import { startRTSPStream } from "../utils/ffmpeg";

export class StreamController {
  static stream(req: Request, res: Response) {
    return startRTSPStream(req, res);
  }
}
