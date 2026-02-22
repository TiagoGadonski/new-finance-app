import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
}

export function PageContainer({ children, title, subtitle, description }: PageContainerProps) {
  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {(title || subtitle || description) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="mt-2 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
