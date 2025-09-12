// Funciones de autenticación y manejo de tokens
export const logout = () => {
  localStorage.removeItem("user");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
