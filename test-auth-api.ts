import { auth } from './lib/auth'

// Check the types
type AuthApi = typeof auth.api
type GetSessionFn = AuthApi['getSession']

console.log('auth.api:', Object.keys(auth.api))
