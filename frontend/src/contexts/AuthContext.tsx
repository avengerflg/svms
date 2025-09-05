import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "../types";
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

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          authService.storeUser(user);
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
        dispatch({ type: "AUTH_FAILURE", payload: "Authentication failed" });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });
      const { user } = await authService.login({ email, password });
      authService.storeUser(user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE", payload: error.message });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });
      const { user } = await authService.register(userData);
      authService.storeUser(user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE", payload: error.message });
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

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
