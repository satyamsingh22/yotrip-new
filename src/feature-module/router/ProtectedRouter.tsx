// import { Navigate } from "react-router";
import { ReactNode } from "react";
// import { useAuth } from "../../context/AuthContext";

// const ProtectedRoute = ({ children }: { children: ReactNode }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth();

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      background: "#fff",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid #eee",
      borderTop: "4px solid #2563eb",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    text: {
      marginTop: "12px",
      fontSize: "14px",
      color: "#666",
    },
  };

  if (status === "loading")
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Checking authentication...</p>
      </div>
    );

  return localStorage.getItem("userEmail") && localStorage.getItem("token")
    ? children
    : <Navigate to="/" />;
};

export default ProtectedRoute;
