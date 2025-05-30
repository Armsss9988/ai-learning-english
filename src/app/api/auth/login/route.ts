import { LoginCredentials } from "@/types/auth";
import { compare } from "bcryptjs";
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
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate required fields
    const validationErrors = validateRequired({ email, password });
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return ApiError.invalidCredentials();
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return ApiError.invalidCredentials();
    }

    // Generate JWT token
    const token = sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userWithoutPassword = omit(user, "password");

    // Return success response with user data and token
    return ApiSuccess.login({
      user: userWithoutPassword,
      token,
    });
  });
}
