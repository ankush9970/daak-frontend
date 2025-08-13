export const hasPermission = (permission) => {
  const permissions = JSON.parse(
    localStorage.getItem("permissions").toLowerCase() || "[]"
  );
  return permissions.includes("all") || permissions.includes(permission.toLowerCase());
};
