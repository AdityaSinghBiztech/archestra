import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const quidditchRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/api/quidditch/stream/:toolCallId",
    {
      schema: {
        operationId: "quidditchStream",
        tags: ["Quidditch"],
        params: z.object({
          toolCallId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      let x = 100;
      let y = 100;
      let z = 50;

      const interval = setInterval(() => {
        // 60fps golden-snitch movement telemetry
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
        z += (Math.random() - 0.5) * 5;

        const data = JSON.stringify({ x, y, z, speed: Math.sqrt(x*x + y*y + z*z) });
        reply.raw.write(`data: ${data}\n\n`);
      }, 16.6); // 60fps

      request.raw.on("close", () => {
        clearInterval(interval);
      });
    }
  );
};

export default quidditchRoutes;
