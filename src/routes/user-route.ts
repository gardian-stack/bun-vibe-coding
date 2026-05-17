import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";

const UserProfileSchema = t.Object({
  id: t.Numeric(),
  username: t.String(),
  email: t.String(),
  created_at: t.Any(),
  updated_at: t.Any(),
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
      username: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 8, maxLength: 255 }),
    }),
    response: {
      200: t.Object({
        data: t.String(),
      }),
      400: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      tags: ["User"],
      summary: "Register User Baru",
      description: "Mendaftarkan user baru ke sistem dengan melakukan hashing password."
    }
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
    }),
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Object({
          token: t.String(),
          user: UserProfileSchema,
        }),
      }),
      401: t.Object({
        message: t.String(),
        error: t.String(),
      }),
    },
    detail: {
      tags: ["User"],
      summary: "Login User",
      description: "Otentikasi user berdasarkan username dan password, menghasilkan session token baru."
    }
  })
  .post("/users/current", async ({ headers, set }) => {
    const authHeader = headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }

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
    }),
    response: {
      200: t.Object({
        message: t.String(),
        data: UserProfileSchema,
      }),
      401: t.Object({
        message: t.String(),
        error: t.String(),
      }),
    },
    detail: {
      tags: ["User"],
      summary: "Dapatkan User Saat Ini",
      description: "Mengambil profil data user yang saat ini sedang login menggunakan token otorisasi Bearer."
    }
  })
  .delete("/users/logout", async ({ headers, set }) => {
    const authHeader = headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      set.status = 401;
      return {
        message: "unauthorized",
        error: "token not found"
      };
    }

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
    }),
    response: {
      200: t.Object({
        message: t.String(),
        data: t.String(),
      }),
      401: t.Object({
        message: t.String(),
        error: t.String(),
      }),
    },
    detail: {
      tags: ["User"],
      summary: "Logout User",
      description: "Mengakhiri session login user dengan menghapus token dari database."
    }
  });
