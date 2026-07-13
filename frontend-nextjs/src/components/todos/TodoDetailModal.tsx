'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Send } from 'lucide-react';
import { TodoItemDto, UpdateTodoRequest, TodoPriority, TodoCategory } from '@/types';
import { todosApi } from '@/lib/api';
import toast from 'react-hot-toast';

const PRIORITY_LABELS: Record<number, string> = { 0: 'Baixa', 1: 'Média', 2: 'Alta' };
const CATEGORY_LABELS: Record<number, string> = {
  0: 'Vagas', 1: 'Pessoal', 2: 'Estudos', 3: 'Negócios', 4: 'Outro',
};

const INPUT = 'mt-1 w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder:text-muted-foreground/50 transition-shadow';

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
    onSuccess: () => { invalidate(); setCommentText(''); },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
          <h2 className="text-sm font-semibold">Detalhe da tarefa</h2>
          <button onClick={onClose} className="text-muted-foreground/60 hover:text-foreground transition-colors focus:outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Título */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Título</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={INPUT} />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Detalhes, links, contexto..."
              className={`${INPUT} resize-none`}
            />
          </div>

          {/* Prazo / Prioridade / Categoria */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Prazo</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Prioridade</label>
              <select
                value={form.priority ?? ''}
                onChange={e => set('priority', e.target.value === '' ? null : Number(e.target.value) as TodoPriority)}
                className={INPUT}
              >
                <option value="">—</option>
                {[0, 1, 2].map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Categoria</label>
              <select
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value === '' ? null : Number(e.target.value) as TodoCategory)}
                className={INPUT}
              >
                <option value="">—</option>
                {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          {/* Concluída */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCompleted}
              onChange={e => set('isCompleted', e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="text-sm text-muted-foreground">Marcar como concluída</span>
          </label>

          {/* Histórico de comentários */}
          <div className="border-t border-border/60 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Histórico · {todo.comments.length} {todo.comments.length === 1 ? 'nota' : 'notas'}
            </p>

            {todo.comments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                {todo.comments.map((c, i) => (
                  <div key={c.id} className="relative pl-5">
                    {/* Timeline line */}
                    {i < todo.comments.length - 1 && (
                      <div className="absolute left-1.5 top-5 bottom-0 w-px bg-border/60" />
                    )}
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-border/60 bg-card" />
                    <div className="bg-muted/40 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-foreground leading-relaxed">{c.text}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        @{c.createdByUsername} · {new Date(c.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) commentMutation.mutate(commentText.trim()); }}
                placeholder="Adicionar nota... (Enter para salvar)"
                className="flex-1 px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/60 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600">Confirmar exclusão?</span>
              <button onClick={() => deleteMutation.mutate()} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700">Excluir</button>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-muted">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border/60 text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity focus:outline-none"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
