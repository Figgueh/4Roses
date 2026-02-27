import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "connection/client";

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          console.error("Verification error:", error.message);
          navigate("/sign-in");
          return;
        }
      }

      navigate("/dashboard");
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      <p style={{ fontFamily: "sans-serif", color: "#6b5a52" }}>Confirming your account…</p>
    </div>
  );
}

export default AuthCallback;
