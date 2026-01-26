export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password: string;
};

export const USERS: UserRecord[] = [
  {
    id: 'user-001',
    email: 'demo@zampastore.it',
    name: 'Demo Utente',
    password: 'Demo123!',
  },
];
