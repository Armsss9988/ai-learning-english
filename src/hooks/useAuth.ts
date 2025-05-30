import { useRouter } from "@/hooks/useRouter";
import { setUser, logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { ApiResponse } from "@/constants/apiCode";
import { User } from "@prisma/client";

interface AuthResponseData {
  token: string;
  user: Omit<User, "password">;
}

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const apiResponse: ApiResponse<AuthResponseData> = response.data;

      if (apiResponse.status === "success" && apiResponse.data?.token) {
        // Save user data and token to localStorage via Redux action
        dispatch(
          setUser({
            user: apiResponse.data.user as User,
            token: apiResponse.data.token,
          })
        );

        // Redirect to learning paths after successful login
        router.push("/learning-paths");
        return { success: true, data: apiResponse.data };
      }

      throw new Error(apiResponse.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      // Re-throw error so the component can handle it
      throw error;
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const apiResponse: ApiResponse<AuthResponseData> = response.data;

      if (apiResponse.status === "success" && apiResponse.data?.token) {
        // Save user data and token to localStorage via Redux action
        dispatch(
          setUser({
            user: apiResponse.data.user as User,
            token: apiResponse.data.token,
          })
        );

        // Redirect to learning paths after successful registration
        router.push("/learning-paths");
        return { success: true, data: apiResponse.data };
      }

      throw new Error(apiResponse.message || "Registration failed");
    } catch (error) {
      console.error("Registration error:", error);
      // Re-throw error so the component can handle it
      throw error;
    }
  };

  const handleLogout = () => {
    // Redux action will handle localStorage cleanup
    dispatch(logout());
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout: handleLogout,
  };
}
