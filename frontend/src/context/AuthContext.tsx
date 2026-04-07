"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  signOut as cognitoSignOut,
  getSession,
} from "@/lib/auth";

const IS_DEV_MODE =
  process.env.NEXT_PUBLIC_DEV_AUTH === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
    !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(IS_DEV_MODE);
  const [isLoading, setIsLoading] = useState(!IS_DEV_MODE);
  const [userEmail, setUserEmail] = useState<string | null>(
    IS_DEV_MODE ? "dev@local.test" : null
  );

  useEffect(() => {
    if (IS_DEV_MODE) return;

    getSession().then((session) => {
      if (session) {
        setIsAuthenticated(true);
        const payload = session.getIdToken().decodePayload();
        setUserEmail(payload.email || null);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (IS_DEV_MODE) {
      setIsAuthenticated(true);
      setUserEmail(email);
      return;
    }
    const session = await cognitoSignIn(email, password);
    setIsAuthenticated(true);
    const payload = session.getIdToken().decodePayload();
    setUserEmail(payload.email || null);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    if (IS_DEV_MODE) return;
    await cognitoSignUp(email, password);
  }, []);

  const confirmSignup = useCallback(
    async (email: string, code: string) => {
      if (IS_DEV_MODE) return;
      await cognitoConfirmSignUp(email, code);
    },
    []
  );

  const logout = useCallback(() => {
    if (!IS_DEV_MODE) cognitoSignOut();
    setIsAuthenticated(false);
    setUserEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userEmail,
        login,
        signup,
        confirmSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
