'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { todosApi } from '@/lib/api';
import { Card, Button, Input, EmptyState } from '@/components/ui';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { TodoItemDto } from '@/types';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'pending' | 'completed';

export default function TodosPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTitle, setNewTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => todosApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTitle('');
      toast.success('Tarefa criada!');
    },
    onError: () => toast.error('Erro ao criar tarefa.'),
  });

  const toggleMutation = useMutation({
    mutationFn: todosApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => toast.error('Erro ao alterar tarefa.'),
  });

  const deleteMutation = useMutation({
    mutationFn: todosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Tarefa excluida!');
    },
    onError: () => toast.error('Erro ao excluir tarefa.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({ title: newTitle.trim() });
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta tarefa?')) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = todos?.filter(t => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  }) ?? [];

  const pendingCount = todos?.filter(t => !t.isCompleted).length ?? 0;
  const completedCount = todos?.filter(t => t.isCompleted).length ?? 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <PageContainer
      title="Tarefas"
      subtitle="Gerencie suas tarefas e lembretes"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{todos?.length ?? 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pendentes</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Concluidas</p>
            </div>
          </Card>
        </div>

        {/* Quick Add */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Nova tarefa..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending || !newTitle.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </form>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluidas'}
            </button>
          ))}
        </div>

        {/* Todo List */}
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((todo) => (
              <Card key={todo.id} className={`hover:shadow-md transition-shadow ${todo.isCompleted ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleMutation.mutate(todo.id)}
                    disabled={toggleMutation.isPending}
                    className="flex-shrink-0"
                  >
                    {todo.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 hover:text-emerald-500 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-slate-500 truncate">{todo.description}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      <span>@{todo.createdByUsername}</span>
                      <span>{formatDate(todo.createdAt)}</span>
                      {todo.dueDate && (
                        <span className="text-amber-500">Vence: {formatDate(todo.dueDate)}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(todo.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ListTodo}
            title="Nenhuma tarefa"
            description={filter === 'all' ? 'Adicione uma tarefa usando o campo acima' : `Nenhuma tarefa ${filter === 'pending' ? 'pendente' : 'concluida'}`}
          />
        )}
      </div>
    </PageContainer>
  );
}
