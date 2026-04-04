import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID as string,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    let newRoles = token.roles;
    try {
      const payload = JSON.parse(
        Buffer.from(refreshedTokens.access_token.split('.')[1], 'base64').toString()
      );
      newRoles = payload?.resource_access?.['skylapp']?.roles ?? [];
    } catch {
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      roles: newRoles,
    };
  } catch (error) {
    console.error('Token yenilenirken hata oluştu:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID as string,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        
      
        token.accessTokenExpires = account.expires_at 
          ? account.expires_at * 1000 
          : Date.now() + 5 * 60 * 1000;

        if (account.access_token) {
          try {
            const payload = JSON.parse(
              Buffer.from(account.access_token.split('.')[1], 'base64').toString()
            );
            token.roles = payload?.resource_access?.['skylapp']?.roles ?? [];
          } catch {
            token.roles = [];
          }
        }
        return token;
      }

    
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      console.log("Access token süresi doldu, yenileniyor...");
      return await refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.roles = (token.roles as string[]) ?? [];
      (session as any).error = token.error; 
      
      return session;
    },
  },
});

export { handler as GET, handler as POST };