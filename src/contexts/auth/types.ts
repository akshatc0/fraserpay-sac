import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';

// Static SAC PIN for development/testing
export const SAC_PIN = '123456';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: FirebaseUser | null;
  login: (studentNumber: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<User | null>;
  register: (studentNumber: string, name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  verifySACPin: (pin: string) => Promise<boolean>;
  verifyBoothPin: (pin: string) => Promise<{ success: boolean, boothId?: string }>;
  joinBooth: (boothId: string) => void;
  updateUserData: (userData: User) => void;
}
