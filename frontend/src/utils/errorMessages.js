// utils/errorMessages.js
export const mapLoginError = (backendMessage) => {
  const errorMappings = {
    "User not found": "User not registered. Please register first and then login.",
    "Email not registered": "User not registered. Please register first and then login.",
    "Invalid password": "invalid password or email"
  };

  return errorMappings[backendMessage] || backendMessage;
};