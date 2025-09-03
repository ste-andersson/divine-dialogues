import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CaseDefect } from '@/types/checklist';
import { useToast } from '@/hooks/use-toast';

export const useCaseDefects = (caseId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['case-defects', caseId],
    queryFn: async (): Promise<CaseDefect[]> => {
      console.log('🔍 Fetching defects from database for case:', caseId);
      
      if (!caseId) {
        console.log('❌ No caseId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('case_defects')
        .select('*')
        .eq('case_id', caseId)
        .order('defect_number', { ascending: true });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('📦 Fetched defects from database:', data);
      return data || [];
    },
    enabled: !!caseId,
  });

  const upsertDefect = useMutation({
    mutationFn: async ({ defectNumber, description }: { 
      defectNumber: number; 
      description: string;
    }) => {
      if (!caseId) throw new Error('No case selected');

      const { data, error } = await supabase
        .from('case_defects')
        .upsert({
          case_id: caseId,
          defect_number: defectNumber,
          description,
        }, {
          onConflict: 'case_id,defect_number'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-defects', caseId] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte spara brist",
        variant: "destructive",
      });
      console.error('Error saving defect:', error);
    },
  });

  const deleteDefect = useMutation({
    mutationFn: async (defectNumber: number) => {
      if (!caseId) throw new Error('No case selected');

      const { error } = await supabase
        .from('case_defects')
        .delete()
        .eq('case_id', caseId)
        .eq('defect_number', defectNumber);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-defects', caseId] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort brist",
        variant: "destructive",
      });
      console.error('Error deleting defect:', error);
    },
  });

  return {
    defects: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    upsertDefect: upsertDefect.mutateAsync, // Return mutateAsync for promise-based usage
    deleteDefect: deleteDefect.mutateAsync,   // Return mutateAsync for promise-based usage
    isUpsertLoading: upsertDefect.isPending,
    isDeleteLoading: deleteDefect.isPending,
  };
};