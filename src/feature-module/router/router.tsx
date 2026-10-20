import React from "react";
import { Route, Routes } from "react-router-dom";
import { authRoutes, publicRoutes, protectedRoutes, adminRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import AdminFeature from "../admin-panel/AdminFeature";
import ProtectedRoute from "./ProtectedRouter";

const ALLRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<Feature />}>
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
          {protectedRoutes.map(({ path, element }, index) => (
            <Route
              key={`protected-${index}`}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
        </Route>

        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>

        <Route element={<AdminFeature />}>
          {adminRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default ALLRoutes;
