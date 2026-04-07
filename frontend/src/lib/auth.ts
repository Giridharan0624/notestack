import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

let _userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool | null {
  if (!_userPool) {
    const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    if (!poolId || !clientId) {
      return null;
    }
    _userPool = new CognitoUserPool({
      UserPoolId: poolId,
      ClientId: clientId,
    });
  }
  return _userPool;
}

function requirePool(): CognitoUserPool {
  const pool = getUserPool();
  if (!pool) {
    throw new Error(
      "Cognito User Pool ID and Client ID must be configured in environment variables"
    );
  }
  return pool;
}

export function signUp(
  email: string,
  password: string
): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];

    requirePool().signUp(email, password, attributes, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result!.user);
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: requirePool() });
    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function signIn(
  email: string,
  password: string
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: requirePool() });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut(): void {
  const pool = getUserPool();
  if (!pool) return;
  const user = pool.getCurrentUser();
  if (user) {
    user.signOut();
  }
}

export function getSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    if (!pool) {
      resolve(null);
      return;
    }
    const user = pool.getCurrentUser();
    if (!user) {
      resolve(null);
      return;
    }
    user.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) {
          resolve(null);
          return;
        }
        resolve(session);
      }
    );
  });
}

export function getIdToken(): Promise<string | null> {
  return getSession().then((session) =>
    session ? session.getIdToken().getJwtToken() : null
  );
}
