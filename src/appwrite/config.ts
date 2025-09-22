import { Account, Client, Databases } from 'appwrite';

// Environment variables
const { VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_ADMIN_USER_ID } =
  import.meta.env;

// Initialize the Appwrite client
const client = new Client();
client.setEndpoint(VITE_APPWRITE_ENDPOINT).setProject(VITE_APPWRITE_PROJECT_ID);

// Initialize Appwrite services
const databases = new Databases(client);
const account = new Account(client);

// Export database ID
export const DATABASES = {
  MAIN: VITE_APPWRITE_DATABASE_ID,
};

// Project
export const PROJECT_ID = VITE_APPWRITE_PROJECT_ID;

// Export collection IDs
export const COLLECTIONS = {
  APPLICATIONS: 'applications',
};

// Export other constants (like Admin user ID)
export const ADMIN = {
  USER_ID: VITE_APPWRITE_ADMIN_USER_ID,
};

// Export Appwrite services
export { client, databases, account };
