import { handleAuth } from '@auth0/nextjs-auth0';

// Обрабатываем все маршруты: login, logout, callback, me.
export const GET = handleAuth();