import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import { authConfig } from '../auth.config';

const returnTo = { appState: { returnTo: '/welcome' } };

export function useAuthActions() {
  const { loginWithRedirect, logout } = useAuth0();
  const queryClient = useQueryClient();
  const signUpWithEmail = () =>
    void loginWithRedirect({
      ...returnTo,
      authorizationParams: { screen_hint: 'signup', redirect_uri: authConfig.redirectUri },
    });
  const signInWithEmail = () =>
    void loginWithRedirect({
      ...returnTo,
      authorizationParams: { redirect_uri: authConfig.redirectUri },
    });
  const signOut = () => {
    queryClient.clear();
    void logout({ logoutParams: { returnTo: authConfig.logoutUri } });
  };
  return { signUpWithEmail, signInWithEmail, signOut };
}
