export interface DecodedToken {
  user_id?: number;
  email?: string;
  role?: string;
  secure_id?: string;
  purpose?: string;
  iss?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
}

/**
 * Decode JWT token to extract payload
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token structure');
      return null;
    }
    
    const payload = parts[1];
    if (!payload) {
      console.error('JWT token payload is missing');
      return null;
    }
    
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param decodedToken - Decoded token object
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (decodedToken: DecodedToken): boolean => {
  if (!decodedToken.exp) return false; // If no exp claim, assume not expired
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

/**
 * Get secure_id from JWT token
 * @param token - JWT token string
 * @returns secure_id string or null if not found
 */
export const getSecureIdFromToken = (token: string): string | null => {
  const decodedToken = decodeToken(token);
  
  if (!decodedToken) {
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(decodedToken)) {
    console.warn('JWT token is expired');
    return null;
  }
  
  return decodedToken.secure_id || null;
};
