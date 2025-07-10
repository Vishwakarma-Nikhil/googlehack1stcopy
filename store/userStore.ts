import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  $id?: string;
  name: string;
  email: string;
  role: string; // Now will support "farmer" or "buyer"
  address: string;
  zipcode: string; // Add zipcode field
  $createdAt?: string;
  $updatedAt?: string;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  registerUser: (
    userData: Omit<User, "$id" | "$createdAt" | "$updatedAt">
  ) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  fetchUserByEmail: (email: string) => Promise<User | null>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      registerUser: async (userData) => {
        try {
          console.log("Starting user registration process", userData);
          set({ isLoading: true, error: null });

          // Use the role provided or default to "farmer"
          const userDataWithRole = {
            ...userData,
            role: userData.role || "farmer",
            zipcode: userData.zipcode || "", // Ensure zipcode is included
          };

          console.log(
            "Sending registration request with data:",
            userDataWithRole
          );
          const response = await fetch(
            "https://efbede333ccb.ngrok-free.app/users",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userDataWithRole),
            }
          );

          const data = await response.json();
          console.log("Registration API response:", data);

          if (!response.ok) {
            throw new Error(data.message || "Registration failed");
          }

          set({
            user: data,
            isLoggedIn: true,
            isLoading: false,
          });
          console.log("User registered successfully:", data);
        } catch (error) {
          console.error("Registration error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            isLoading: false,
          });
        }
      },

      loginUser: async (email, password) => {
        try {
          console.log("Starting login process for:", email);
          set({ isLoading: true, error: null });

          console.log("Fetching user data for:", email);
          const response = await fetch(
            `https://efbede333ccb.ngrok-free.app/users/${email}`
          );

          // Read raw text for debugging
          const raw = await response.text();
          console.log("Raw login response:", raw);

          // Try parsing JSON safely
          let userData;
          try {
            userData = JSON.parse(raw);
          } catch (parseError) {
            throw new Error("Invalid JSON response from server");
          }

          if (!response.ok) {
            throw new Error(userData?.message || "Login failed");
          }

          const userRole = userData.role || "unknown";
          console.log("User role detected:", userRole);

          set({
            user: userData,
            isLoggedIn: true,
            isLoading: false,
          });
          console.log("User logged in successfully:", userData);

          return userRole;
        } catch (error) {
          console.error("Login error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            isLoading: false,
          });
        }
      },

      logoutUser: () => {
        console.log("Logging out user");
        set({ user: null, isLoggedIn: false });
      },

      fetchUserByEmail: async (email) => {
        try {
          console.log("Fetching user data for:", email);
          const response = await fetch(
            `https://efbede333ccb.ngrok-free.app/${email}`
          );

          if (!response.ok) {
            console.log("User not found:", email);
            return null;
          }

          const userData = await response.json();
          console.log("User data retrieved:", userData);
          return userData;
        } catch (error) {
          console.error("Error fetching user:", error);
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
