import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

// Обрабатываем все маршруты: login, logout, callback, me.
export const GET = handleAuth({
    signup: handleLogin({ authorizationParams: { screen_hint: 'signup' } })
});