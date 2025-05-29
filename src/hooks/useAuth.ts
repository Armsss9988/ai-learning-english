import { useRouter } from "next/navigation";
import { setUser, logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
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
      const { data: userData } = await api.post("/auth/login", {
        email,
        password,
      });
      dispatch(setUser(userData));
    } catch (error) {
      console.error("Login error:", error);
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
      const { data: userData } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      dispatch(setUser(userData));
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
