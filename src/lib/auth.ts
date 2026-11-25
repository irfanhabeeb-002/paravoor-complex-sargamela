// Simple authentication (will be replaced with real auth later)
const ADMIN_EMAIL = "amalPARAVOOR@gmail.com";
const ADMIN_PASSWORD = "amalPARAVOOR";

export const login = (email: string, password: string): boolean => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isAuthenticated") === "true";
};

export const setAuthenticated = (value: boolean): void => {
  localStorage.setItem("isAuthenticated", value.toString());
};

export const logout = (): void => {
  localStorage.removeItem("isAuthenticated");
};
