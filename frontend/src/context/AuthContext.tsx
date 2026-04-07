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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
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
    const session = await cognitoSignIn(email, password);
    setIsAuthenticated(true);
    const payload = session.getIdToken().decodePayload();
    setUserEmail(payload.email || null);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    await cognitoSignUp(email, password);
  }, []);

  const confirmSignup = useCallback(
    async (email: string, code: string) => {
      await cognitoConfirmSignUp(email, code);
    },
    []
  );

  const logout = useCallback(() => {
    cognitoSignOut();
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
