import type { AuthProviderProps } from "react-oidc-context";

export const googleOidcConfig: AuthProviderProps = {
  authority: 'https://accounts.google.com', // OpenID Connect provider (Google)
  client_id: import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI,
  client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  response_type: "code", // use Authorization Code flow (PKCE)
  scope: 'openid profile email',
  automaticSilentRenew: false,
  loadUserInfo: false,
  filterProtocolClaims: true,
};

