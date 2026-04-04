import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

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
      // İlk login'de Keycloak'tan gelen access_token'ı ve rolleri sakla
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;

        if (account.access_token) {
          try {
            const payload = JSON.parse(
              Buffer.from(account.access_token.split('.')[1], 'base64').toString()
            );
            
            // DÜZELTME BURADA: 'skylapp-web' yerine 'skylapp' yazmalıyız.
            token.roles = payload?.resource_access?.['skylapp']?.roles ?? [];
            
          } catch {
            token.roles = [];
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.roles = (token.roles as string[]) ?? [];
      return session;
    },
  },
});

export { handler as GET, handler as POST };