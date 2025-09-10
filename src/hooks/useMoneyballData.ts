import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moneyballApi } from '../services/api';
import type { 
  Player, 
  BudgetTier, 
  OptimizationResults, 
  MarketOpportunityMatrix,
  PriceAlert,
  CompetitiveIntelligence,
  OptimizationConstraints 
} from '../types/moneyball';

// Transfer Portal Hooks
export const useTransferPortalPlayers = () => {
  return useQuery({
    queryKey: ['transfer-portal-players'],
    queryFn: () => moneyballApi.getTransferPortalPlayers(),
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

export const usePlayerDetails = (playerId: number) => {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => moneyballApi.getPlayerDetails(playerId),
    enabled: !!playerId,
  });
};

// Roster Upload Hooks
export const useUploadRoster = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => moneyballApi.uploadRoster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-portal-players'] });
    },
  });
};

export const useUploadSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['upload-session', sessionId],
    queryFn: () => sessionId ? moneyballApi.getUploadSession(sessionId) : null,
    enabled: !!sessionId,
  });
};

export const useBulkAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => moneyballApi.runBulkAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-session'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-portal-players'] });
    },
  });
};

// Moneyball Optimization Hooks
export const useOptimizeRoster = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      budgetTier, 
      constraints 
    }: { 
      budgetTier: BudgetTier;
      constraints: OptimizationConstraints;
    }) => moneyballApi.optimizeRoster(budgetTier, constraints),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimization-results'] });
    },
  });
};

export const useOptimizationResults = (optimizationId: string | null) => {
  return useQuery({
    queryKey: ['optimization-results', optimizationId],
    queryFn: () => optimizationId ? moneyballApi.getOptimizationResults(optimizationId) : null,
    enabled: !!optimizationId,
  });
};

// Market Intelligence Hooks
export const useMarketMatrix = () => {
  return useQuery({
    queryKey: ['market-matrix'],
    queryFn: () => moneyballApi.getMarketMatrix(),
    refetchInterval: 600000, // Refresh every 10 minutes
  });
};

export const usePriceAlerts = () => {
  return useQuery({
    queryKey: ['price-alerts'],
    queryFn: () => moneyballApi.getPriceAlerts(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useCompetitiveIntelligence = () => {
  return useQuery({
    queryKey: ['competitive-intelligence'],
    queryFn: () => moneyballApi.getCompetitiveIntelligence(),
    refetchInterval: 1800000, // Refresh every 30 minutes
  });
};

// Analytics Hooks
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => moneyballApi.getAnalyticsDashboard(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const usePositionAnalysis = (position: string) => {
  return useQuery({
    queryKey: ['position-analysis', position],
    queryFn: () => moneyballApi.getPositionAnalysis(position),
    enabled: !!position,
  });
};

// Player Analysis Hooks
export const useAnalyzePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playerId: number) => moneyballApi.analyzePlayer(playerId),
    onSuccess: (data, playerId) => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] });
    },
  });
};

export const usePlayerEvaluation = () => {
  return useMutation({
    mutationFn: (playerId: string) => moneyballApi.evaluatePlayer(playerId),
  });
};

export const useBaronHopsonAnalysis = () => {
  return useMutation({
    mutationFn: (playerStats: any) => moneyballApi.runBaronHopsonAnalysis(playerStats),
  });
};

// Budget Management Hooks
export const useBudgetStatus = () => {
  return useQuery({
    queryKey: ['budget-status'],
    queryFn: () => moneyballApi.getBudgetStatus(),
  });
};

export const useUpdateBudgetAllocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => moneyballApi.updateBudgetAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
    },
  });
};

// NIL Opportunity Hooks
export const useNILOpportunities = () => {
  return useQuery({
    queryKey: ['nil-opportunities'],
    queryFn: () => moneyballApi.getNILOpportunities(),
  });
};

export const useMatchNILOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, athleteId }: { opportunityId: number; athleteId: number }) =>
      moneyballApi.matchNILOpportunity(opportunityId, athleteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nil-opportunities'] });
    },
  });
};