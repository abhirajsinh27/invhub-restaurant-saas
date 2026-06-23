import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL } from "../config";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const normalizeUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      userId: userData.userId || userData._id,
      _id: userData._id || userData.userId,
    };
  };

  useEffect(() => {
    fetch(`${API_URL}/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
       
        return res.json();
      })
      .then((data) => {
        setUser(normalizeUser(data));
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = (userData) => {
    setUser(normalizeUser(userData));
  };

  const logout = () => {
  fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then(() => {
      setUser(null);
    })
    .catch((err) => {
      console.log(err);
    });
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider };