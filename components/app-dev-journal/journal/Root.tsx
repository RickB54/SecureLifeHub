// @ts-nocheck
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

export default function Root() {
  return (
    <GoogleOAuthProvider clientId="15diamondbilliards.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  );
}
