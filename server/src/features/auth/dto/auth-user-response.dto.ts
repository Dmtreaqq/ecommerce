import type { User } from '../../users/entities/user.entity.js';
import type { AuthenticatedUser } from '../types/authenticated-user.js';

export class AuthUserResponseDto {
  id: string;
  email: string;
  name: string;

  /**
   * Always empty: there is no purchases table yet, and the seeded products get
   * generated uuids, so no purchase history can be attributed to a user.
   */
  purchasedProductIds: string[];

  static fromEntity(user: User | AuthenticatedUser): AuthUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      purchasedProductIds: [],
    };
  }
}
