import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  type LoginRequest,
  type UserFromAPI,
} from "@/lib/api";

interface AuthContextType {
  user: UserFromAPI | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<UserFromAPI | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken =
        localStorage.getItem("cloudos_token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setToken(storedToken);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("cloudos_token");
        localStorage.removeItem("cloudos_user");

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    data: LoginRequest
  ) => {
    const result = await loginUser(data);

    localStorage.setItem(
      "cloudos_token",
      result.access_token
    );

    setToken(result.access_token);

    const currentUser =
      await getCurrentUser();

    localStorage.setItem(
      "cloudos_user",
      JSON.stringify(currentUser)
    );

    setUser(currentUser);
  };

  const logout = () => {
    logoutUser();

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}