import { useNavigate } from "react-router-dom";
import { UserAuth } from "connection/auth/authContext";

function Dashboard() {
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();

  const handleSignOut = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/sign-in");
  };

  return (
    <div>
      <span>Welcome {session?.user?.email}</span>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
}

export default Dashboard;
