import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .post("/user", async ({ body, set }) => {
    const result = await registerUser(body);

    if (result.success) {
      return { data: "oke" };
    } else {
      set.status = 400;
      return { error: "gagal membuat user" };
    }
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/users/login", async ({ body, set }) => {
    const result = await loginUser(body);

    if (result.success) {
      return {
        message: "Login successful",
        data: result.data,
      };
    } else {
      set.status = 401;
      return {
        message: "Invalid credentials",
        error: "Unauthorized",
      };
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    })
  });
