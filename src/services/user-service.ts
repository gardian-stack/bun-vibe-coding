import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";

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
