export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  confirm: "/confirm",
} as const

export const DEFAULT_LOGIN_REDIRECT = "/admin/home"

export const PROTECTED_ROUTE_PREFIX = "/admin"
