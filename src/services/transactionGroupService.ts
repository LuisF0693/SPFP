/**
 * Transaction Group Validation Service - STY-038
 * Implements:
 * - FK constraint validation (group_id references)
 * - Orphan detection (transactions with invalid group_id)
 * - Cleanup scripts (handle orphaned records)
 * - Group integrity checks
 */

import { Transaction } from '../types';
import { supabase } from '../supabase';

export interface OrphanedTransaction extends Transaction {
  reason: string;
}

export interface GroupValidationResult {
  isValid: boolean;
  orphanedCount: number;
  orphans: OrphanedTransaction[];
  invalidGroupReferences: string[];
  errors: string[];
}

/**
 * Validates transaction group integrity
 */
export const transactionGroupService = {
  /**
   * Detect orphaned transactions (invalid group_id references)
   */
  detectOrphans: async (userId: string): Promise<GroupValidationResult> => {
    try {
      const result: GroupValidationResult = {
        isValid: true,
        orphanedCount: 0,
        orphans: [],
        invalidGroupReferences: [],
        errors: []
      };

      // Query transactions with group_id
      const { data: transactionsWithGroups, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .not('group_id', 'is', null);

      if (txError) {
        result.errors.push(`Failed to fetch transactions: ${txError.message}`);
        result.isValid = false;
        return result;
      }

      if (!transactionsWithGroups || transactionsWithGroups.length === 0) {
        return result;
      }

      // Get all valid group IDs for this user
      const { data: validGroups, error: groupError } = await supabase
        .from('transaction_groups')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (groupError) {
        result.errors.push(`Failed to fetch groups: ${groupError.message}`);
        result.isValid = false;
        return result;
      }

      const validGroupIds = new Set((validGroups || []).map(g => g.id));

      // Find orphaned transactions
      const orphans: OrphanedTransaction[] = [];

      for (const tx of transactionsWithGroups) {
        if (tx.group_id && !validGroupIds.has(tx.group_id)) {
          orphans.push({
            ...tx,
            reason: `Invalid group reference: ${tx.group_id}`
          });
        }
      }

      result.orphanedCount = orphans.length;
      result.orphans = orphans;
      result.isValid = orphans.length === 0;
      result.invalidGroupReferences = [...new Set(orphans.map(o => o.group_id))];

      console.log(`[GROUP VALIDATION] Orphan detection complete:`, {
        total: transactionsWithGroups.length,
        orphanedCount: orphans.length,
        validGroups: validGroupIds.size
      });

      return result;
    } catch (error: any) {
      console.error('[GROUP VALIDATION] Orphan detection failed:', error);
      return {
        isValid: false,
        orphanedCount: 0,
        orphans: [],
        invalidGroupReferences: [],
        errors: [error.message]
      };
    }
  },

  /**
   * Validate transaction group before operations
   */
  validateGroup: async (groupId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('transaction_groups')
        .select('id')
        .eq('id', groupId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.warn(`[GROUP VALIDATION] Group validation failed: ${error.message}`);
        return false;
      }

      return !!data;
    } catch (error: any) {
      console.error('[GROUP VALIDATION] Validation error:', error);
      return false;
    }
  },

  /**
   * Cleanup orphaned transactions (multiple strategies)
   */
  cleanupOrphans: async (
    userId: string,
    strategy: 'remove_group' | 'delete' | 'archive' = 'remove_group'
  ): Promise<{ cleaned: number; failed: number; errors: string[] }> => {
    const result = { cleaned: 0, failed: 0, errors: [] as string[] };

    try {
      const validation = await transactionGroupService.detectOrphans(userId);

      if (validation.orphans.length === 0) {
        console.log('[GROUP VALIDATION] No orphans to clean up');
        return result;
      }

      const orphanIds = validation.orphans.map(o => o.id);

      switch (strategy) {
        case 'remove_group':
          // Clear group_id (convert to single transactions)
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ group_id: null, group_index: null })
            .in('id', orphanIds);

          if (updateError) {
            result.errors.push(`Update failed: ${updateError.message}`);
            result.failed = orphanIds.length;
          } else {
            result.cleaned = orphanIds.length;
            console.log(`[GROUP VALIDATION] Removed ${orphanIds.length} orphan group references`);
          }
          break;

        case 'delete':
          // Soft delete orphaned transactions
          const { error: deleteError } = await supabase
            .from('transactions')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', orphanIds);

          if (deleteError) {
            result.errors.push(`Delete failed: ${deleteError.message}`);
            result.failed = orphanIds.length;
          } else {
            result.cleaned = orphanIds.length;
            console.log(`[GROUP VALIDATION] Soft-deleted ${orphanIds.length} orphan transactions`);
          }
          break;

        case 'archive':
          // Create archive records (if needed)
          console.log(`[GROUP VALIDATION] Archive strategy not yet implemented`);
          result.errors.push('Archive strategy not yet implemented');
          break;
      }

      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  },

  /**
   * Validate transaction before insertion (check group validity)
   */
  validateTransactionBeforeInsert: async (transaction: Partial<Transaction>): Promise<{
    valid: boolean;
    error?: string;
  }> => {
    // If no group, it's valid
    if (!transaction.group_id) {
      return { valid: true };
    }

    // If group provided, validate it exists
    if (transaction.user_id) {
      const isValid = await transactionGroupService.validateGroup(
        transaction.group_id,
        transaction.user_id
      );

      if (!isValid) {
        return {
          valid: false,
          error: `Transaction group not found: ${transaction.group_id}`
        };
      }
    }

    return { valid: true };
  },

  /**
   * Get all transactions in a group
   */
  getGroupTransactions: async (groupId: string, userId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('group_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('[GROUP VALIDATION] Failed to fetch group transactions:', error);
      return [];
    }
  },

  /**
   * Validate group integrity (all transactions have correct group_index)
   */
  validateGroupIntegrity: async (groupId: string, userId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> => {
    const transactions = await transactionGroupService.getGroupTransactions(groupId, userId);
    const issues: string[] = [];

    if (transactions.length === 0) {
      return { isValid: true, issues };
    }

    // Check sequential group_index
    const indexes = transactions
      .map(t => t.group_index)
      .filter(idx => idx !== null && idx !== undefined)
      .sort((a, b) => (a as number) - (b as number));

    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] !== i + 1) {
        issues.push(`Non-sequential group_index at position ${i}: expected ${i + 1}, got ${indexes[i]}`);
      }
    }

    // Check all transactions reference the same group
    const uniqueGroups = new Set(transactions.map(t => t.group_id));
    if (uniqueGroups.size > 1) {
      issues.push(`Transactions reference multiple groups: ${Array.from(uniqueGroups).join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  },

  /**
   * Fix group_index ordering (renumber from 1)
   */
  fixGroupIndexing: async (groupId: string, userId: string): Promise<{
    fixed: number;
    errors: string[];
  }> => {
    const result = { fixed: 0, errors: [] as string[] };

    try {
      const transactions = await transactionGroupService.getGroupTransactions(groupId, userId);

      if (transactions.length === 0) {
        return result;
      }

      // Sort by date and renumber
      const sorted = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (let i = 0; i < sorted.length; i++) {
        const { error } = await supabase
          .from('transactions')
          .update({ group_index: i + 1 })
          .eq('id', sorted[i].id);

        if (error) {
          result.errors.push(`Failed to update transaction ${sorted[i].id}: ${error.message}`);
        } else {
          result.fixed++;
        }
      }

      console.log(`[GROUP VALIDATION] Fixed ${result.fixed} transactions group_index`);
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }
};

export default transactionGroupService;
