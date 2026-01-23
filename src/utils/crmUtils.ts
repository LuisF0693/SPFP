/**
 * CRM Utilities
 * Shared logic for client health scoring and engagement analysis.
 */

export interface ClientEntry {
    user_id: string;
    content: any;
    last_updated: number;
}

/**
 * Calculates a health score (0-100) for a client based on activity and data completeness.
 */
export const calculateHealthScore = (client: ClientEntry) => {
    const now = Date.now();
    const diffDays = Math.floor((now - client.last_updated) / (1000 * 60 * 60 * 24));

    let score = 100;

    // Decay based on inactivity
    if (diffDays > 30) score -= 60;
    else if (diffDays > 15) score -= 30;
    else if (diffDays > 7) score -= 15;

    // Bonus for data completeness
    const content = client.content || {};
    const accounts = Array.isArray(content.accounts) ? content.accounts : [];
    const transactions = Array.isArray(content.transactions) ? content.transactions : [];
    const goals = Array.isArray(content.goals) ? content.goals : [];

    if (accounts.length > 0) score += 5;
    if (transactions.length > 50) score += 5;
    if (goals.length > 0) score += 5;

    return Math.min(100, Math.max(0, score));
};
