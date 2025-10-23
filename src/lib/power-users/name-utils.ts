import { MasterUserRecord } from '@/types/power-users';

/**
 * Get the display name for a user
 * Priority: firstName + lastName > email
 */
export function getUserDisplayName(user: MasterUserRecord): string {
  const firstName = user.firstName?.trim();
  const lastName = user.lastName?.trim();
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (lastName) {
    return lastName;
  }
  
  return user.email;
}

/**
 * Get a short display name for charts (limited space)
 * Returns: "F. LastName" or truncated name/email
 */
export function getShortDisplayName(user: MasterUserRecord, maxLength: number = 15): string {
  const firstName = user.firstName?.trim();
  const lastName = user.lastName?.trim();
  
  if (firstName && lastName) {
    const shortName = `${firstName.charAt(0)}. ${lastName}`;
    if (shortName.length <= maxLength) {
      return shortName;
    }
    // If still too long, truncate
    return shortName.substring(0, maxLength - 3) + '...';
  }
  
  if (firstName) {
    return firstName.length <= maxLength ? firstName : firstName.substring(0, maxLength - 3) + '...';
  }
  
  if (lastName) {
    return lastName.length <= maxLength ? lastName : lastName.substring(0, maxLength - 3) + '...';
  }
  
  // Fallback to truncated email
  const emailParts = user.email.split('@');
  const emailShort = emailParts[0].length > 12 
    ? `${emailParts[0].substring(0, 12)}...@${emailParts[1]}`
    : user.email;
  
  return emailShort;
}

/**
 * Check if a user has a name (firstName or lastName)
 */
export function hasUserName(user: MasterUserRecord): boolean {
  return Boolean(user.firstName?.trim() || user.lastName?.trim());
}

