import { User } from "../types";

// In-memory user storage
export const users = new Map<string, User>();

// Find user by email
export const findUserByEmail = (email: string): User | undefined => {
    return Array.from(users.values()).find(
        user => user.email === email
    );
};

// Find user by ID
export const findUserById = (id: string): User | undefined => {
    return users.get(id);
};

// Save user
export const saveUser = (user: User): void => {
    users.set(user.id, user);
};