import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Query } from 'appwrite';
import { AppwriteService } from '@/appwrite/utils';
import { DATABASES, COLLECTIONS } from '@/appwrite/config';

export const useGetApplicationsQuery = (status?: ApplicationStatus) => {
  return useQuery({
    queryKey: ['applications', status],
    queryFn: async () => {
      const queries = [];

      // Add status filter if provided
      if (status) {
        queries.push(Query.equal('status', status));
      }

      // Always order by creation date (latest first)
      queries.push(Query.orderDesc('$createdAt'));

      const response = await AppwriteService.listDocuments(DATABASES.MAIN, COLLECTIONS.APPLICATIONS, queries);
      return {
        data: response.documents as unknown as Application[],
        total: response.total,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useGetApplicationQuery = (id: string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const response = await AppwriteService.getDocument(DATABASES.MAIN, COLLECTIONS.APPLICATIONS, id);
      return response as unknown as Application;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await AppwriteService.createDocument(DATABASES.MAIN, COLLECTIONS.APPLICATIONS, data);
      return { ok: true, message: 'Application created successfully', data: response };
    },
    onSuccess: () => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: error => {
      console.error('Error creating application:', error);
      throw error;
    },
  });
};

export const useUpdateApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ApplicationFormData>; }) => {
      const response = await AppwriteService.updateDocument(DATABASES.MAIN, COLLECTIONS.APPLICATIONS, id, data);
      return { ok: true, message: 'Application updated successfully', data: response };
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
    },
    onError: error => {
      console.error('Error updating application:', error);
      throw error;
    },
  });
};

export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await AppwriteService.deleteDocument(DATABASES.MAIN, COLLECTIONS.APPLICATIONS, id);
      return { ok: true, message: 'Application deleted successfully' };
    },
    onSuccess: () => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: error => {
      console.error('Error deleting application:', error);
      throw error;
    },
  });
};

// Utility hook for application statistics
export const useApplicationStats = () => {
  const { data: applications } = useGetApplicationsQuery();

  return {
    total: applications?.total || 0,
    applied: applications?.data.filter(app => app.status === 'applied').length || 0,
    interview: applications?.data.filter(app => app.status === 'interview').length || 0,
    offers: applications?.data.filter(app => app.status === 'offer').length || 0,
    rejected: applications?.data.filter(app => app.status === 'rejected').length || 0,
  };
};