'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Input, Button, Alert } from '@/components/ui';
import { authApi } from '@/lib/api/authApi';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    defaultValues: {
      email: 'demo@example.com',
      password: 'Demo1234',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      authApi.setToken(response.accessToken, response.refreshToken);
      authApi.setUser(response.user);
      router.push('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{
        background: 'var(--background)',
        backgroundImage: 'radial-gradient(circle at 20% 50%, var(--primary-light) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--info-light) 0%, transparent 50%)'
      }}
    >
      <div className="max-w-md w-full">
        <div
          className="rounded-2xl shadow-xl border p-8 sm:p-10 backdrop-blur-sm transition-all duration-300"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg hover:shadow-xl transition-shadow">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2
              className="mt-6 text-center text-3xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              FinanceApp
            </h2>
            <p
              className="mt-2 text-center text-sm opacity-70"
              style={{ color: 'var(--foreground)' }}
            >
              Faça login para continuar
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

            <div className="space-y-5">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Senha"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter no mínimo 6 caracteres',
                  },
                })}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
