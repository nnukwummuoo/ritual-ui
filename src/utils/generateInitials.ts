/**
 * Generate user initials from name data
 * @param firstName - User's first name
 * @param lastName - User's last name  
 * @param nickname - User's nickname (fallback)
 * @param username - User's username (fallback)
 * @returns Generated initials string
 */
export const generateInitials = (
  firstName?: string,
  lastName?: string,
  nickname?: string,
  username?: string
): string => {
  // Try to get initials from first and last name
  if (firstName && lastName) {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }
  
  // If only first name is available
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  
  // If only last name is available
  if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }
  
  // Fallback to nickname
  if (nickname) {
    // Remove @ symbol if present
    const cleanNickname = nickname.replace('@', '');
    if (cleanNickname.length >= 2) {
      return cleanNickname.substring(0, 2).toUpperCase();
    }
    return cleanNickname.charAt(0).toUpperCase();
  }
  
  // Fallback to username
  if (username) {
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    if (cleanUsername.length >= 2) {
      return cleanUsername.substring(0, 2).toUpperCase();
    }
    return cleanUsername.charAt(0).toUpperCase();
  }
  
  // Ultimate fallback
  return 'U';
};
