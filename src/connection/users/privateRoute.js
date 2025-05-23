import React from "react";
import PropTypes from "prop-types";

import { UserAuth } from "connection/auth/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { session, authLoading } = UserAuth();

  if (authLoading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

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
