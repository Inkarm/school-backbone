'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function logout() {
    await signOut();
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirect: false,
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Nieprawidłowe dane logowania.';
                default:
                    return 'Wystąpił błąd.';
            }
        }
        throw error;
    }
}
