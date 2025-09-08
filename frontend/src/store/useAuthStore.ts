import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
interface signupprops {
  fullName: string;
  email: string;
  password: string;
}
interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  signup: (data: signupprops) => void;
  isUpdatingProfile: boolean;
  updatingProfile: (data: string | ArrayBuffer | null) => Promise<void>;
  Login: (data: object) => Promise<void>;
  isLoggingIn: boolean;
  Logout: () => Promise<void>;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  connectSocket: () => void;
  socket: null | Socket;
  onlineUser: string[];
}
interface User {
  _id: string;
  fullname: string;
  userPic?: string;
  createdAt: string;
  updatedAt: string;
  email: string;
}
export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  onlineUser: [],
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/api/auth/check");
      console.log(response.data);
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.log("error in checkingAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log(data);
      const response = await axiosInstance.post("/api/auth/signup", data);
      set({ authUser: response.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);

        toast.error(error.message);
      } else {
        toast.error("Internal Server Error");
      }
    }
  },
  Login: async (data) => {
    try {
      console.log(data);
      const response = await axiosInstance.post("/api/auth/login", data);
      set({ authUser: response.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      console.log(response.data);
    } catch (error) {
      if (error instanceof Error) {
        set({ authUser: null });
        toast.error(error.message);
      } else {
        set({ authUser: null });

        toast.error("Internal server error");
      }
    }
  },
  updatingProfile: async (data) => {
    try {
      set({ isUpdatingProfile: true });
      const response = await axiosInstance.post("/api/auth/update-profile", {
        profilePic: data,
      });
      set({ authUser: response.data });
      toast.success("Profile Updated!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Internal Server Error");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  Logout: async () => {
    try {
      set({ isLoggingIn: true });
      await axiosInstance.post("/auth/signout");
      set({ authUser: null });
      toast.success("Logout successful");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Internal Server Error");
      }
    } finally {
      set({
        isLoggingIn: false,
      });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser && get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser?._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (ids) => {
      set({ onlineUser: ids });
    });
  },
  disconnectSocket: () => {
    if (get()?.socket?.connected) get().socket?.disconnect();
  },
}));
