'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-powered audit and discrepancy analysis.
 *
 * - aiAuditDiscrepancyAnalysis - A function that analyzes audit logs and repair history to identify unusual asset wear or mismatch patterns across branches.
 * - AiAuditDiscrepancyAnalysisInput - The input type for the aiAuditDiscrepancyAnalysis function.
 * - AiAuditDiscrepancyAnalysisOutput - The return type for the aiAuditDiscrepancyAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AiAuditDiscrepancyAnalysisInputSchema = z.object({
  auditLogs: z
    .string()
    .describe(
      'Detailed audit logs for various assets, potentially across different branches. This includes maintenance records, movement logs, and status changes.'
    ),
  repairHistory: z
    .string()
    .describe(
      'Comprehensive repair history for all assets, detailing dates, types of repairs, costs, and reported issues.'
    ),
  branchInfo: z
    .string()
    .describe(
      'Information about the different branches, including their names and any relevant operational context (e.g., "Khodad is manufacturing, Manjarwadi is distribution").'
    ),
  assetDetails: z
    .string()
    .describe(
      'A list of asset details including their IDs, types, current locations, and any other relevant attributes.'
    ),
});
export type AiAuditDiscrepancyAnalysisInput = z.infer<
  typeof AiAuditDiscrepancyAnalysisInputSchema
>;

// Output Schema
const AiAuditDiscrepancyAnalysisOutputSchema = z.object({
  discrepanciesFound: z
    .boolean()
    .describe('True if any unusual wear, mismatch patterns, or inconsistencies were detected.'),
  analysisSummary: z
    .string()
    .describe(
      'A concise summary of the AI audit, highlighting key findings, overall health of asset management, and general patterns observed.'
    ),
  flaggedAssets: z
    .array(z.string())
    .describe('A list of asset IDs that exhibit unusual wear, mismatch patterns, or require further investigation.'),
  recommendations: z
    .array(z.string())
    .describe('Actionable recommendations based on the detected discrepancies or patterns.'),
});
export type AiAuditDiscrepancyAnalysisOutput = z.infer<
  typeof AiAuditDiscrepancyAnalysisOutputSchema
>;

export async function aiAuditDiscrepancyAnalysis(
  input: AiAuditDiscrepancyAnalysisInput
): Promise<AiAuditDiscrepancyAnalysisOutput> {
  return aiAuditDiscrepancyAnalysisFlow(input);
}

const aiAuditDiscrepancyAnalysisPrompt = ai.definePrompt({
  name: 'aiAuditDiscrepancyAnalysisPrompt',
  input: {schema: AiAuditDiscrepancyAnalysisInputSchema},
  output: {schema: AiAuditDiscrepancyAnalysisOutputSchema},
  prompt: `You are an expert AI Audit & Discrepancy Analyst for SampattiPro, an asset management system. Your task is to meticulously analyze provided audit logs, repair history, and asset details across different branches to identify any unusual asset wear, mismatch patterns, or inconsistencies.\n\nPay close attention to:\n- Assets with unusually high or low repair frequencies compared to their type or age.\n- Discrepancies between reported asset locations in audit logs and expected locations based on branch information.\n- Patterns suggesting improper usage or accelerated wear for specific asset types or in particular branches.\n- Mismatches between asset types and their reported repair issues.\n- Any signs of assets being transferred frequently without clear justification, or sudden changes in status.\n\nYou must consider the operational context of each branch as provided in the branch information when assessing patterns.\n\nHere is the data for your analysis:\n\nBranch Information:\n{{{branchInfo}}}\n\nAsset Details:\n{{{assetDetails}}}\n\nAudit Logs:\n{{{auditLogs}}}\n\nRepair History:\n{{{repairHistory}}}\n\nBased on this information, provide a structured analysis in JSON format, indicating if discrepancies were found, a summary of your findings, a list of specific asset IDs that are flagged, and actionable recommendations.\n`,
});

const aiAuditDiscrepancyAnalysisFlow = ai.defineFlow(
  {
    name: 'aiAuditDiscrepancyAnalysisFlow',
    inputSchema: AiAuditDiscrepancyAnalysisInputSchema,
    outputSchema: AiAuditDiscrepancyAnalysisOutputSchema,
  },
  async input => {
    const {output} = await aiAuditDiscrepancyAnalysisPrompt(input);
    return output!;
  }
);
