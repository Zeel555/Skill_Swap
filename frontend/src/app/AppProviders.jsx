import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../features/users/userSlice";
import { restoreSession } from "../features/auth/authSlice";
import { SocketProvider } from "../context/SocketContext"; // ✅ ADD THIS

const AppProviders = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated && !user) {
      // Token exists but user not loaded - fetch profile to restore session
      dispatch(getProfile());
    }
  }, [dispatch, user, isAuthenticated]);

  useEffect(() => {
    // When profile loads, restore auth session
    if (profile && !isAuthenticated) {
      dispatch(restoreSession(profile));
    }
  }, [profile, isAuthenticated, dispatch]);

  // ✅ WRAP CHILDREN WITH SOCKET PROVIDER
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
};

export default AppProviders;
