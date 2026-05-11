import React from "react";
import PropTypes from "prop-types";

import { UserAuth } from "connection/auth/authContext";
import { Navigate } from "react-router-dom";
import LoadingScreen from "components/Loading/LoadingScreen";

const PrivateRoute = ({ children }) => {
  const { session, authLoading } = UserAuth();

  if (authLoading) return <LoadingScreen />;

  return session ? (
    children
  ) : (
    <Navigate to="/sign-in" state={{ message: "You need to be signed in to see this page." }} />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.any,
};

export default PrivateRoute;
