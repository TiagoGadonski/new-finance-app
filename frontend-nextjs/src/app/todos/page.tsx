'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { todosApi } from '@/lib/api';
import { TodoItemDto, TodoPriority, TodoCategory, CreateTodoRequest } from '@/types';
import { TodoDetailModal } from '@/components/todos/TodoDetailModal';
import {
  ListTodo, Plus, ChevronDown, ChevronUp, CheckCircle2, Circle,
  AlertTriangle, Clock, Flag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_LABELS: Record<number, string> = { 0: 'Baixa', 1: 'Média', 2: 'Alta' };
const PRIORITY_COLORS: Record<number, string> = {
  0: 'text-slate-400',
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
  4: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
};

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: '0', label: 'Vagas' },
  { value: '1', label: 'Pessoal' },
  { value: '2', label: 'Estudos' },
  { value: '3', label: 'Negócios' },
  { value: '4', label: 'Outro' },
];

export default function TodosPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [extras, setExtras] = useState({ description: '', dueDate: '', priority: '', category: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [detail, setDetail] = useState<TodoItemDto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => todosApi.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['todos', 'stats'],
    queryFn: todosApi.getStats,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.create(data),
    onSuccess: () => {
      invalidate();
      setTitle('');
      setExtras({ description: '', dueDate: '', priority: '', category: '' });
      setShowExtras(false);
      toast.success('Tarefa criada!');
      inputRef.current?.focus();
    },
  });

  const doneMutation = useMutation({
    mutationFn: (id: string) => todosApi.markDone(id),
    onSuccess: invalidate,
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: extras.description || null,
      dueDate: extras.dueDate || null,
      priority: extras.priority !== '' ? Number(extras.priority) as TodoPriority : null,
      category: extras.category !== '' ? Number(extras.category) as TodoCategory : null,
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  const filtered = todos.filter(t => {
    if (!showCompleted && t.isCompleted) return false;
    if (categoryFilter !== '' && t.category !== Number(categoryFilter)) return false;
    return true;
  });

  const pending = filtered.filter(t => !t.isCompleted);
  const completed = filtered.filter(t => t.isCompleted);

  const getDueBadge = (dueDate: string | null, isCompleted: boolean) => {
    if (!dueDate || isCompleted) return null;
    if (dueDate < today) return <span className="text-xs text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />Vencida</span>;
    if (dueDate === today) return <span className="text-xs text-amber-500 flex items-center gap-0.5"><Clock className="w-3 h-3" />Hoje</span>;
    return <span className="text-xs text-muted-foreground">{new Date(dueDate + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>;
  };

  const openDetail = async (t: TodoItemDto) => {
    try {
      const fresh = await todosApi.getById(t.id);
      setDetail(fresh);
    } catch {
      setDetail(t);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tarefas</h1>
            <p className="text-sm text-muted-foreground">Organize o que precisa fazer</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Pendentes', value: stats.pending, color: 'text-foreground' },
              { label: 'Vencidas', value: stats.overdue, color: 'text-red-500' },
              { label: 'Hoje', value: stats.dueToday, color: 'text-amber-500' },
              { label: 'Feitas/sem.', value: stats.completedThisWeek, color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick add */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Nova tarefa... (Enter para adicionar)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!title.trim() || createMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <button
            onClick={() => setShowExtras(v => !v)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {showExtras ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            + detalhes opcionais
          </button>

          {showExtras && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="col-span-2">
                <input
                  value={extras.description}
                  onChange={e => setExtras(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição (opcional)"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <input
                type="date"
                value={extras.dueDate}
                onChange={e => setExtras(p => ({ ...p, dueDate: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={extras.priority}
                onChange={e => setExtras(p => ({ ...p, priority: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Prioridade</option>
                <option value="0">Baixa</option>
                <option value="1">Média</option>
                <option value="2">Alta</option>
              </select>
              <select
                value={extras.category}
                onChange={e => setExtras(p => ({ ...p, category: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Categoria</option>
                {CATEGORY_FILTER_OPTIONS.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Filtros por categoria */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTER_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setCategoryFilter(o.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === o.value ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">Nenhuma tarefa pendente</p>
            <p className="text-sm mt-1">Adicione uma acima ou mostre as concluídas.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pending.map(t => (
              <TodoCard key={t.id} todo={t} today={today} onToggle={() => doneMutation.mutate(t.id)} onOpen={() => openDetail(t)} getDueBadge={getDueBadge} />
            ))}
          </div>
        )}

        {/* Toggle concluídas */}
        <button
          onClick={() => setShowCompleted(v => !v)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showCompleted ? 'Ocultar' : 'Mostrar'} concluídas ({todos.filter(t => t.isCompleted).length})
        </button>

        {showCompleted && (
          <div className="space-y-1.5 opacity-60">
            {completed.map(t => (
              <TodoCard key={t.id} todo={t} today={today} onToggle={() => doneMutation.mutate(t.id)} onOpen={() => openDetail(t)} getDueBadge={getDueBadge} />
            ))}
          </div>
        )}
      </div>

      {detail && (
        <TodoDetailModal
          todo={detail}
          onClose={() => { setDetail(null); invalidate(); }}
        />
      )}
    </PageContainer>
  );
}

function TodoCard({
  todo, today, onToggle, onOpen, getDueBadge,
}: {
  todo: TodoItemDto;
  today: string;
  onToggle: () => void;
  onOpen: () => void;
  getDueBadge: (dueDate: string | null, isCompleted: boolean) => React.ReactNode;
}) {
  return (
    <div className={`flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-emerald-500/40 transition-colors ${todo.isCompleted ? 'opacity-60' : ''}`}>
      <button onClick={onToggle} className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-600 transition-colors">
        {todo.isCompleted
          ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          : <Circle className="w-5 h-5" />}
      </button>
      <button className="flex-1 min-w-0 text-left" onClick={onOpen}>
        <p className={`text-sm font-medium ${todo.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{todo.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {getDueBadge(todo.dueDate, todo.isCompleted)}
          {todo.category !== null && todo.category !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[todo.category]}`}>
              {CATEGORY_LABELS[todo.category]}
            </span>
          )}
          {todo.priority !== null && todo.priority !== undefined && (
            <span className={`text-xs flex items-center gap-0.5 ${PRIORITY_COLORS[todo.priority]}`}>
              <Flag className="w-3 h-3" />{PRIORITY_LABELS[todo.priority]}
            </span>
          )}
          {todo.comments.length > 0 && (
            <span className="text-xs text-muted-foreground">{todo.comments.length} nota{todo.comments.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </button>
    </div>
  );
}
