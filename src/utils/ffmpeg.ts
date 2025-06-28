import { spawn } from "child_process";
import { Request, Response } from "express";
import { config } from "../config";

export function startRTSPStream(req: Request, res: Response) {
	res.writeHead(200, {
		"Content-Type": "multipart/x-mixed-replace; boundary=frame",
		"Cache-Control": "no-cache",
		Connection: "close",
		Pragma: "no-cache",
	});

	const ffmpeg = spawn("ffmpeg", [
  "-rtsp_transport", "tcp",
  "-i", config.rtspUrl,
  "-f", "image2pipe",
  "-vf", "fps=15,scale=640:360",
  "-qscale:v", "5",
  "-vcodec", "mjpeg",
  "-"
]);

	let frameBuffer = Buffer.alloc(0);

	ffmpeg.stdout.on("data", (chunk) => {
		frameBuffer = Buffer.concat([frameBuffer, chunk]);
		let endMarker;
		while (
			(endMarker = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]))) !== -1
		) {
			const completeFrame = frameBuffer.slice(0, endMarker + 2);

			res.write(`--frame\r\n`);
			res.write(`Content-Type: image/jpeg\r\n`);
			res.write(`Content-Length: ${completeFrame.length}\r\n\r\n`);
			res.write(completeFrame);
			res.write("\r\n");

			frameBuffer = frameBuffer.slice(endMarker + 2);
		}
	});

	ffmpeg.stderr.on("data", (data) => {
		console.error(`[FFmpeg stderr] ${data.toString()}`);
	});

	ffmpeg.on("close", () => {
		console.log("FFmpeg process closed");
		res.end();
	});

	req.on("close", () => {
		ffmpeg.kill("SIGINT");
	});
}
