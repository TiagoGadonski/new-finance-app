'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Modal, Button, Select } from '@/components/ui';
import { accountsApi } from '@/lib/api';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);
  const [csvContent, setCsvContent] = useState('');

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
    enabled: isOpen,
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/Transactions/import/csv', {
        accountId,
        csvContent,
      });
      return response.data;
    },
    onSuccess: (data: any) => {
      const count = Array.isArray(data) ? data.length : 0;
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(`${count} transações importadas com sucesso`);
      onClose();
      resetState();
    },
    onError: () => {
      toast.error('Erro ao importar transações');
    },
  });

  const resetState = () => {
    setFile(null);
    setAccountId('');
    setPreview([]);
    setCsvContent('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const text = await selectedFile.text();
    setCsvContent(text);

    // Parse preview (first 5 rows)
    const lines = text.split('\n').filter(l => l.trim());
    const rows = lines.slice(0, 6).map(line =>
      line.split(/[,;]/).map(cell => cell.replace(/"/g, '').trim())
    );
    setPreview(rows);
  };

  const handleImport = () => {
    if (!accountId) {
      toast.error('Selecione uma conta');
      return;
    }
    if (!csvContent) {
      toast.error('Selecione um arquivo CSV');
      return;
    }
    importMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); resetState(); }} title="Importar Transações">
      <div className="space-y-4">
        <div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col items-center">
              {file ? (
                <>
                  <FileSpreadsheet className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Clique para selecionar CSV ou OFX
                  </p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept=".csv,.ofx" onChange={handleFileChange} />
          </label>
        </div>

        <Select label="Conta de Destino" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Selecionar conta</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>

        {preview.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Preview</p>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
              <table className="w-full text-xs">
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={i === 0 ? 'font-semibold' : ''} style={{ backgroundColor: i === 0 ? 'var(--background-secondary)' : undefined }}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1 border-r" style={{ borderColor: 'var(--border-color)', color: 'var(--foreground)' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                O sistema tentará detectar automaticamente as colunas de data, descrição e valor.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => { onClose(); resetState(); }}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || !accountId || importMutation.isPending}>
            {importMutation.isPending ? 'Importando...' : `Importar Transações`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
