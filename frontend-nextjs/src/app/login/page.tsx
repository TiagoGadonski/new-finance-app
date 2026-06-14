'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Input, Button } from '@/components/ui';
import { authApi } from '@/lib/api/authApi';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    defaultValues: {
      username: '',
      password: '',
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
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(74, 222, 128, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(45, 212, 191, 0.08) 0%, transparent 50%)'
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
              <Image src="/orbit-logo.svg" alt="Orbit" width={64} height={64} />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold gradient-text">
              Orbit
            </h2>
            <p
              className="mt-2 text-center text-sm opacity-70"
              style={{ color: 'var(--foreground)' }}
            >
              Faca login para continuar
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium border" style={{
                backgroundColor: 'var(--warning-light)',
                borderColor: 'var(--warning)',
                color: 'var(--foreground)',
              }}>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Usuario"
                type="text"
                autoComplete="off"
                {...register('username', {
                  required: 'Usuario e obrigatorio',
                  minLength: {
                    value: 3,
                    message: 'Usuario deve ter no minimo 3 caracteres',
                  },
                })}
                error={errors.username?.message}
              />

              <Input
                label="Senha"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Senha e obrigatoria',
                  minLength: {
                    value: 8,
                    message: 'Senha deve ter no minimo 8 caracteres',
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
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
                  className="font-medium text-emerald-600 hover:text-emerald-500"
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
