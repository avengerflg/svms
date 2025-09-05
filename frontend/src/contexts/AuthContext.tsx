import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { User } from "../types";
import { authService } from "../services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hasInitialized = useRef(false);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (state.isLoading && !state.isAuthenticated) {
        console.warn("AuthContext: Loading timeout, setting to false");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }, 3000); // Reduced to 3 seconds

    return () => clearTimeout(timeout);
  }, [state.isLoading, state.isAuthenticated]);

  // Check for existing authentication on mount - ONLY ONCE
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized.current) {
      return;
    }

    const checkAuth = () => {
      console.log("AuthContext: Initial authentication check...");

      // Check if we have a token and stored user
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          console.log(
            "AuthContext: Found stored user, using immediately:",
            storedUser
          );
          dispatch({ type: "AUTH_SUCCESS", payload: storedUser });
          hasInitialized.current = true;
          return;
        }
      }

      // No token or stored user
      console.log("AuthContext: No valid auth data found");
      dispatch({ type: "SET_LOADING", payload: false });
      hasInitialized.current = true;
    };

    // Run immediately without async to avoid delays
    checkAuth();
  }, []); // Empty dependency array - run only once

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        dispatch({ type: "AUTH_START" });
        const { user } = await authService.login({ email, password });
        authService.storeUser(user);

        // Set initialized flag to prevent interference from useEffect
        hasInitialized.current = true;

        // Dispatch success immediately
        dispatch({ type: "AUTH_SUCCESS", payload: user });

        console.log("AuthContext: Login successful, user authenticated:", user);
      } catch (error: any) {
        dispatch({ type: "AUTH_FAILURE", payload: error.message });
        throw error;
      }
    },
    []
  );

  const register = useCallback(async (userData: any): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });
      const { user } = await authService.register(userData);
      authService.storeUser(user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE", payload: error.message });
      throw error;
    }
  }, []);

  const logout = useCallback((): void => {
    authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const refreshUser = async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser();
      authService.storeUser(user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
