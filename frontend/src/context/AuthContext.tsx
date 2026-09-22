import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from "react"
  
  import {
    AUTH_TOKEN_KEY,
    authApi,
    type ApiCurrentUser,
    type UserRole,
  } from "../lib/api"
  
  
  type AuthContextType = {
    user:
      | ApiCurrentUser
      | null
  
    isAuthenticated: boolean
  
    loading: boolean
  
    login: (
      email: string,
      password: string,
    ) => Promise<void>
  
    logout: () => void
  
    hasRole: (
      ...roles: UserRole[]
    ) => boolean
  }
  
  
  const AuthContext =
    createContext<
      AuthContextType | undefined
    >(undefined)
  
  
  export function AuthProvider({
    children,
  }: {
    children: ReactNode
  }) {
    const [
      user,
      setUser,
    ] =
      useState<
        ApiCurrentUser | null
      >(null)
  
    const [
      loading,
      setLoading,
    ] =
      useState(true)
  
  
    function logout() {
      localStorage.removeItem(
        AUTH_TOKEN_KEY,
      )
  
      setUser(null)
    }
  
  
    useEffect(
      () => {
        const loadUser =
          async () => {
            const token =
              localStorage.getItem(
                AUTH_TOKEN_KEY,
              )
  
            if (!token) {
              setLoading(false)
              return
            }
  
            try {
              const currentUser =
                await authApi.getMe()
  
              setUser(
                currentUser,
              )
            } catch {
              logout()
            } finally {
              setLoading(false)
            }
          }
  
        void loadUser()
      },
      [],
    )
  
  
    useEffect(
      () => {
        const handleUnauthorized =
          () => {
            logout()
          }
  
        window.addEventListener(
          "queuepulse:unauthorized",
          handleUnauthorized,
        )
  
        return () => {
          window.removeEventListener(
            "queuepulse:unauthorized",
            handleUnauthorized,
          )
        }
      },
      [],
    )
  
  
    async function login(
      email: string,
      password: string,
    ) {
      const response =
        await authApi.login(
          email.trim(),
          password,
        )
  
      localStorage.setItem(
        AUTH_TOKEN_KEY,
        response.access_token,
      )
  
      const currentUser =
        await authApi.getMe()
  
      setUser(
        currentUser,
      )
    }
  
  
    function hasRole(
      ...roles: UserRole[]
    ) {
      if (!user) {
        return false
      }
  
      return roles.includes(
        user.role,
      )
    }
  
  
    return (
      <AuthContext.Provider
        value={{
          user,
  
          isAuthenticated:
            Boolean(user),
  
          loading,
  
          login,
  
          logout,
  
          hasRole,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
  
  
  export function useAuth() {
    const context =
      useContext(
        AuthContext,
      )
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider",
      )
    }
  
    return context
  }