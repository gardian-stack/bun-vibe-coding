import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-service";

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
  });
