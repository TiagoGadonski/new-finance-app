'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classificationRulesApi } from '@/lib/api';
import { Card, Button, Input, EmptyState } from '@/components/ui';
import { ClassificationRuleModal } from './ClassificationRuleModal';
import { Plus, Trash2, Edit2, Search, BookOpen } from 'lucide-react';
import { ClassificationRuleDto, CategorySuggestionDto } from '@/types';
import toast from 'react-hot-toast';

export function ClassificationRulesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ClassificationRuleDto | null>(null);
  const [testDescription, setTestDescription] = useState('');
  const [suggestion, setSuggestion] = useState<CategorySuggestionDto | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['classificationRules'],
    queryFn: classificationRulesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: classificationRulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classificationRules'] });
      toast.success('Regra excluida!');
    },
    onError: () => toast.error('Erro ao excluir regra.'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTest = async () => {
    if (!testDescription.trim()) return;
    setIsTesting(true);
    try {
      const result = await classificationRulesApi.suggest(testDescription);
      setSuggestion(result);
    } catch {
      toast.error('Erro ao testar sugestao.');
    } finally {
      setIsTesting(false);
    }
  };

  const manualRules = rules?.filter(r => !r.isLearned) || [];
  const learnedRules = rules?.filter(r => r.isLearned) || [];

  return (
    <div className="space-y-6">
      {/* Suggest Tester */}
      <Card>
        <div className="p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Testar Sugestao
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              placeholder="Digite uma descricao para testar..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
            />
            <Button onClick={handleTest} disabled={isTesting || !testDescription.trim()}>
              {isTesting ? 'Testando...' : 'Testar'}
            </Button>
          </div>
          {suggestion && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              {suggestion.categoryId ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-medium">Categoria sugerida:</span> {suggestion.categoryName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Palavra-chave: &quot;{suggestion.matchedKeyword}&quot; | Confianca: {Math.round(suggestion.confidence * 100)}%
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhuma regra correspondente encontrada.</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingRule(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : rules && rules.length > 0 ? (
        <div className="space-y-6">
          {/* Manual Rules */}
          {manualRules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                Regras Manuais ({manualRules.length})
              </h3>
              <div className="grid gap-3">
                {manualRules.map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => { setEditingRule(rule); setIsModalOpen(true); }}
                    onDelete={() => handleDelete(rule.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Learned Rules */}
          {learnedRules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Regras Aprendidas ({learnedRules.length})
              </h3>
              <div className="grid gap-3">
                {learnedRules.map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => { setEditingRule(rule); setIsModalOpen(true); }}
                    onDelete={() => handleDelete(rule.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma regra de classificacao"
          description="Crie regras para classificar transacoes automaticamente com base em palavras-chave"
          action={{
            label: "Nova Regra",
            onClick: () => { setEditingRule(null); setIsModalOpen(true); }
          }}
        />
      )}

      {isModalOpen && (
        <ClassificationRuleModal
          rule={editingRule}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
}

function RuleCard({
  rule,
  onEdit,
  onDelete,
  isDeleting,
}: {
  rule: ClassificationRuleDto;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <span className="text-sm font-mono font-medium text-emerald-700 dark:text-emerald-300">
              {rule.keyword}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              → {rule.categoryName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {rule.priority > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  Prioridade: {rule.priority}
                </span>
              )}
              <span className="text-xs text-slate-500">
                por @{rule.createdByUsername}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 text-emerald-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
