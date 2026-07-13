'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, MessageSquare, Send } from 'lucide-react';
import { TodoItemDto, UpdateTodoRequest, TodoPriority, TodoCategory } from '@/types';
import { todosApi } from '@/lib/api';
import toast from 'react-hot-toast';

const PRIORITY_LABELS: Record<number, string> = { 0: 'Baixa', 1: 'Média', 2: 'Alta' };
const PRIORITY_COLORS: Record<number, string> = {
  0: 'text-slate-500',
  1: 'text-amber-500',
  2: 'text-red-500',
};
const CATEGORY_LABELS: Record<number, string> = {
  0: 'Vagas', 1: 'Pessoal', 2: 'Estudos', 3: 'Negócios', 4: 'Outro',
};
const CATEGORY_COLORS: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  4: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
};

interface Props {
  todo: TodoItemDto;
  onClose: () => void;
}

export function TodoDetailModal({ todo, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: todo.title,
    description: todo.description ?? '',
    dueDate: todo.dueDate ?? '',
    priority: todo.priority,
    category: todo.category,
    isCompleted: todo.isCompleted,
  });
  const [commentText, setCommentText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['todos'] });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTodoRequest) => todosApi.update(todo.id, data),
    onSuccess: () => { invalidate(); toast.success('Tarefa atualizada'); onClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => todosApi.delete(todo.id),
    onSuccess: () => { invalidate(); toast.success('Tarefa excluída'); onClose(); },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => todosApi.addComment(todo.id, { text }),
    onSuccess: () => { invalidate(); setCommentText(''); toast.success('Comentário adicionado'); },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title: form.title,
      description: form.description || null,
      dueDate: form.dueDate || null,
      priority: form.priority,
      category: form.category,
      isCompleted: form.isCompleted,
    });
  };

  const set = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-sm">Detalhe da tarefa</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {/* Título */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Título</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Detalhes, links, contexto..."
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Prazo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prazo</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
              <select
                value={form.priority ?? ''}
                onChange={e => set('priority', e.target.value === '' ? null : Number(e.target.value) as TodoPriority)}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">—</option>
                {[0, 1, 2].map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoria</label>
              <select
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value === '' ? null : Number(e.target.value) as TodoCategory)}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">—</option>
                {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          {/* Concluída */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCompleted}
              onChange={e => set('isCompleted', e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm">Marcar como concluída</span>
          </label>

          {/* Histórico de comentários */}
          <div className="border-t border-border pt-3">
            <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Histórico ({todo.comments.length})
            </h3>

            {todo.comments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {todo.comments.map(c => (
                  <div key={c.id} className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-foreground">{c.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      @{c.createdByUsername} · {new Date(c.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) commentMutation.mutate(commentText.trim()); }}
                placeholder="Adicionar comentário... (Enter para salvar)"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Confirmar exclusão?</span>
              <button onClick={() => deleteMutation.mutate()} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium">Excluir</button>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
