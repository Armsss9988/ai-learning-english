import { RegisterData } from "@/types/auth";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";
import { omit } from "lodash";
import {
  ApiSuccess,
  ApiError,
  apiHandler,
  validateRequired,
} from "@/utils/apiResponse";
import { API_MESSAGE } from "@/constants/apiCode";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body: RegisterData = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    const validationErrors = validateRequired({ email, password, name });
    if (validationErrors.length > 0) {
      return ApiError.validation(
        API_MESSAGE.VALIDATION_ERROR,
        validationErrors
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiError.validation(API_MESSAGE.INVALID_EMAIL_FORMAT, [
        "Invalid email format",
      ]);
    }

    // Validate password length
    if (password.length < 6) {
      return ApiError.validation(API_MESSAGE.PASSWORD_TOO_SHORT, [
        "Password must be at least 6 characters",
      ]);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiError.emailExists();
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userWithoutPassword = omit(user, "password");

    // Return success response
    return ApiSuccess.register({
      user: userWithoutPassword,
      token,
    });
  });
}
