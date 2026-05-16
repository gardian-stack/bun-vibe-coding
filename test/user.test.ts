import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("User API Tests", () => {
  // Pembersihan data sebelum setiap test case
  beforeEach(async () => {
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/user (Register)", () => {
    it("harus berhasil mendaftar dengan data valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBe("oke");

      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, "testuser"),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.username).toBe("testuser");
    });

    it("harus gagal jika username sudah terdaftar", async () => {
      // Daftarkan user pertama
      await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "duplicate",
            email: "first@example.com",
            password: "password123",
          }),
        })
      );

      // Coba daftar lagi dengan username yang sama
      const response = await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "duplicate",
            email: "second@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe("gagal membuat user");
    });

    it("harus gagal jika validasi input tidak terpenuhi (username terlalu panjang)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "A".repeat(51),
            email: "valid@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    it("harus berhasil login dan mendapatkan token", async () => {
      // Setup user
      await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "loginuser",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "loginuser",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toBe("Login successful");
      expect(result.data.token).toBeDefined();
      expect(result.data.user.username).toBe("loginuser");
      expect(result.data.user.password).toBeUndefined();
    });

    it("harus gagal jika kredensial salah", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "wronguser",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.message).toBe("Invalid credentials");
    });
  });

  describe("POST /api/users/current", () => {
    it("harus berhasil mendapatkan data user saat ini dengan token valid", async () => {
      // Setup user & login
      await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "currentuser",
            email: "current@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "currentuser",
            password: "password123",
          }),
        })
      );
      const { data } = await loginRes.json();
      const token = data.token;

      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toBe("success");
      expect(result.data.username).toBe("currentuser");
    });

    it("harus gagal jika token tidak valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer invalid-token",
          },
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout", () => {
    it("harus berhasil logout dan menghapus sesi di database", async () => {
      // Setup user & login
      await app.handle(
        new Request("http://localhost/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "logoutuser",
            email: "logout@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "logoutuser",
            password: "password123",
          }),
        })
      );
      const { data } = await loginRes.json();
      const token = data.token;

      // Logout
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBe("Logout successful");

      // Verifikasi sesi terhapus
      const session = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.token, token),
      });
      expect(session).toBeUndefined();
    });

    it("harus gagal logout jika token salah", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer wrong-token",
          },
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
