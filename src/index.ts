import { Elysia } from "elysia";
import { userRoute } from "./routes/user-route";

export const app = new Elysia()
  .use(userRoute)
  .get("/", () => ({
    message: "Hello Elysia!",
    status: "online",
  }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
