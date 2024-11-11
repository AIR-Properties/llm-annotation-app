export const isAuthenticated = (): boolean => {
  const userName = localStorage.getItem("userName");
  return !!userName && userName.trim().length >= 2;
};

export const getUserName = (): string | null => {
  return localStorage.getItem("userName");
};

export const setUserName = (name: string): void => {
  if (name && name.trim().length >= 2) {
    localStorage.setItem("userName", name.trim());
  }
};

export const clearUserName = (): void => {
  localStorage.removeItem("userName");
};
