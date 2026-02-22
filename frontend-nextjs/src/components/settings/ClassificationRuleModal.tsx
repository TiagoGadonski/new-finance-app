'use client';

import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { classificationRulesApi, categoriesApi } from '@/lib/api';
import { ClassificationRuleDto, CreateClassificationRuleRequest, UpdateClassificationRuleRequest } from '@/types';
import toast from 'react-hot-toast';

interface ClassificationRuleModalProps {
  rule?: ClassificationRuleDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClassificationRuleModal({ rule, isOpen, onClose }: ClassificationRuleModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!rule;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      keyword: rule?.keyword || '',
      categoryId: rule?.categoryId || '',
      priority: rule?.priority ?? 0,
      isLearned: rule?.isLearned ?? false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClassificationRuleRequest) => classificationRulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classificationRules'] });
      onClose();
      toast.success('Regra criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar regra.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClassificationRuleRequest) => classificationRulesApi.update(rule!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classificationRules'] });
      onClose();
      toast.success('Regra atualizada com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar regra.'),
  });

  const onSubmit = (data: any) => {
    if (isEditing) {
      updateMutation.mutate({
        keyword: data.keyword,
        categoryId: data.categoryId,
        priority: parseInt(data.priority),
      });
    } else {
      createMutation.mutate({
        keyword: data.keyword,
        categoryId: data.categoryId,
        priority: parseInt(data.priority),
        isLearned: data.isLearned,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Regra' : 'Nova Regra'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Palavra-chave"
          placeholder="Ex: Uber, iFood, Netflix"
          {...register('keyword', { required: 'Palavra-chave e obrigatoria' })}
          error={errors.keyword?.message}
        />

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Categoria</label>
          <select
            {...register('categoryId', { required: 'Categoria e obrigatoria' })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Selecione uma categoria</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        <Input
          label="Prioridade"
          type="number"
          placeholder="0 (maior = mais prioridade)"
          {...register('priority')}
        />

        {!isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isLearned')}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Regra aprendida (auto)</span>
          </label>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Criar Regra'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
