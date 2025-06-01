
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { sanitizeString, validateUserId } from './documents/documentSecurity';

export type Profile = Tables<'profiles'>;

export interface ProfileUpdateData {
  username?: string;
  full_name?: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateProfileData(data: ProfileUpdateData): ProfileValidationResult {
  const errors: string[] = [];

  // Validate username
  if (data.username !== undefined) {
    if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    if (data.username.length > 50) {
      errors.push('Username must be less than 50 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
  }

  // Validate full name
  if (data.full_name !== undefined) {
    if (data.full_name.length > 100) {
      errors.push('Full name must be less than 100 characters');
    }
    if (/<script|javascript:|on\w+=/i.test(data.full_name)) {
      errors.push('Full name contains invalid characters');
    }
  }

  // Validate bio
  if (data.bio !== undefined) {
    if (data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
  }

  // Validate website URL
  if (data.website !== undefined && data.website.length > 0) {
    try {
      const url = new URL(data.website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Website must be a valid HTTP or HTTPS URL');
      }
    } catch {
      errors.push('Website must be a valid URL');
    }
  }

  // Validate avatar URL
  if (data.avatar_url !== undefined && data.avatar_url.length > 0) {
    try {
      const url = new URL(data.avatar_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Avatar URL must be a valid HTTP or HTTPS URL');
      }
    } catch {
      errors.push('Avatar URL must be a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  // Validate user ID format
  if (!validateUserId(userId)) {
    throw new Error('Invalid user ID format');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: ProfileUpdateData): Promise<Profile> => {
  // Validate user ID format
  if (!validateUserId(userId)) {
    throw new Error('Invalid user ID format');
  }

  // Get current user to ensure they're updating their own profile
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    throw new Error('Unauthorized: Cannot update another user\'s profile');
  }

  // Validate input data
  const validation = validateProfileData(updates);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Sanitize string inputs
  const sanitizedUpdates: Partial<Profile> = {};
  
  if (updates.username !== undefined) {
    sanitizedUpdates.username = sanitizeString(updates.username, 50);
  }
  if (updates.full_name !== undefined) {
    sanitizedUpdates.full_name = sanitizeString(updates.full_name, 100);
  }
  if (updates.bio !== undefined) {
    sanitizedUpdates.bio = sanitizeString(updates.bio, 500);
  }
  if (updates.website !== undefined) {
    sanitizedUpdates.website = sanitizeString(updates.website, 200);
  }
  if (updates.avatar_url !== undefined) {
    sanitizedUpdates.avatar_url = sanitizeString(updates.avatar_url, 500);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(sanitizedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
};

export const getUsernameById = async (userId: string): Promise<string | null> => {
  // Validate user ID format
  if (!validateUserId(userId)) {
    console.error('Invalid user ID format provided to getUsernameById');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching username:', error);
    return null;
  }

  return data?.username || null;
};

// Additional security function to check if username is already taken
export const isUsernameAvailable = async (username: string, excludeUserId?: string): Promise<boolean> => {
  const sanitizedUsername = sanitizeString(username, 50);
  
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', sanitizedUsername);

  if (excludeUserId && validateUserId(excludeUserId)) {
    query = query.neq('id', excludeUserId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error checking username availability:', error);
    return false;
  }

  return data === null; // Username is available if no profile found
};
