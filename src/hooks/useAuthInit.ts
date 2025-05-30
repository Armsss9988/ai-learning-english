import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrate, setLoading } from "@/store/slices/authSlice";

/**
 * Hook to initialize authentication state on app startup
 * Handles automatic token verification and state hydration
 */
export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      try {
        // First, hydrate from localStorage
        dispatch(hydrate());

        // Check if we have a token
        const token = localStorage.getItem("token");

        if (token) {
          try {
            // Verify token with server (optional)
            // You can uncomment this if you have a /auth/verify endpoint
            // const response = await api.get('/auth/verify');
            // if (response.data.status === 'success') {
            //   dispatch(setUser(response.data.data));
            // } else {
            //   throw new Error('Token verification failed');
            // }

            // For now, just trust the localStorage data if token exists
            console.log("Auth initialized from localStorage");
          } catch (error) {
            console.error("Token verification failed:", error);
            // Clear invalid token
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch(hydrate()); // Re-hydrate with cleared data
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);
};

export default useAuthInit;
