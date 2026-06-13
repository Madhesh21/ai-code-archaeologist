interface User {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'guest';

enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

class UserService {
  private users: Map<string, User> = new Map();

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = { id, ...data };
    this.users.set(id, user);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
}

export { UserService, Status };
export type { User, UserRole };
