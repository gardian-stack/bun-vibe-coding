import { db } from "../db";
import { users, sessions } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * Mendaftarkan pengguna baru.
 * Fungsi ini melakukan enkripsi (hashing) pada password menggunakan bcrypt
 * sebelum menyimpan data pengguna (username, email, password) ke database.
 * 
 * @param data Data registrasi pengguna (username, email, password)
 * @returns Objek dengan status success true jika berhasil, atau false jika gagal
 */
export const registerUser = async (data: any) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.insert(users).values({
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false };
  }
};

/**
 * Melakukan proses otentikasi/login pengguna.
 * Fungsi ini memverifikasi username dan password. Jika valid, akan membuat 
 * sesi (token) baru yang berlaku selama 7 hari dan menyimpannya ke database.
 * 
 * @param data Data login pengguna (username, password)
 * @returns Objek berisi status success, token, dan data pengguna (tanpa password)
 */
export const loginUser = async (data: any) => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, data.username),
    });

    if (!user) return { success: false };

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) return { success: false };

    const token = crypto.randomUUID();
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    await db.insert(sessions).values({
      user_id: user.id,
      token,
      expired_at: expiredAt,
    });

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false };
  }
};

/**
 * Mengambil data profil pengguna yang sedang login.
 * Fungsi ini memeriksa validitas token sesi di database dan memastikannya 
 * belum kedaluwarsa, lalu mengembalikan data pengguna terkait.
 * 
 * @param token Token sesi pengguna
 * @returns Objek berisi status success dan data pengguna (tanpa password) jika valid
 */
export const getCurrentUser = async (token: string) => {
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: {
        user: true,
      },
    });

    if (!session || !session.user) {
      return { success: false };
    }

    // Periksa apakah token sudah kedaluwarsa
    if (new Date() > session.expired_at) {
      return { success: false };
    }

    const { password, ...userWithoutPassword } = session.user;

    return {
      success: true,
      data: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { success: false };
  }
};

/**
 * Mengakhiri sesi pengguna (Logout).
 * Fungsi ini menghapus token sesi pengguna dari database sehingga token 
 * tersebut tidak dapat digunakan lagi.
 * 
 * @param token Token sesi pengguna yang ingin diakhiri
 * @returns Objek dengan status success true jika berhasil dihapus
 */
export const logoutUser = async (token: string) => {
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session) return { success: false };

    await db.delete(sessions).where(eq(sessions.token, token));

    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
};
