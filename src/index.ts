import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoute } from "./routes/user-route";

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API Documentation',
        version: '1.0.0',
        description: 'Dokumentasi API untuk manajemen user'
      }
    }
  }))
  .use(userRoute)
  .get("/", () => ({
    message: "Hello Elysia!",
    status: "online",
  }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
