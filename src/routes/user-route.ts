import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";

const authMiddleware = new Elysia()
  .derive(({ headers, set }) => {
    const authHeader = headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("token not found");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      set.status = 401;
      throw new Error("token not found");
    }

    return { token };
  })
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') return;
    
    if (error.message === "token not found") {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }
  });

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
  })
  .use(authMiddleware)
  .post("/users/current", async ({ token, set }) => {
    const result = await getCurrentUser(token);

    if (result.success) {
      return {
        message: "success",
        data: result.data,
      };
    } else {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }
  }, {
    headers: t.Object({
      authorization: t.String()
    })
  })
  .delete("/users/logout", async ({ token, set }) => {
    const result = await logoutUser(token);

    if (result.success) {
      return {
        message: "success",
        data: "Logout successful"
      };
    } else {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }
  }, {
    headers: t.Object({
      authorization: t.String()
    })
  });
