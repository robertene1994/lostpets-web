import { Role } from './types/role';
import { UserStatus } from './types/user-status';

export class User {
    id: number;
    email: string;
    password: string;
    role: Role;
    status: UserStatus;
    phone: string;
    firstName: string;
    lastName: string;
}
