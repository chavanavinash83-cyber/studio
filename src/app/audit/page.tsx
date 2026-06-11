
"use client";

import { useState } from "react";
import { aiAuditDiscrepancyAnalysis, AiAuditDiscrepancyAnalysisOutput } from "@/ai/flows/ai-audit-discrepancy-analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BrainCircuit, AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MOCK_ASSETS } from "../lib/mock-data";

export default function AuditPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiAuditDiscrepancyAnalysisOutput | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Prepare mock inputs for the AI to analyze
    const input = {
      branchInfo: "Khodad is main admin, Manjarwadi handles logistics, Sultanpur is IT hub, Ghodegaon is heavy manufacturing.",
      assetDetails: JSON.stringify(MOCK_ASSETS),
      auditLogs: "Audit 2024-01: Asset VEH-MN-022 reported in Ghodegaon but record says Manjarwadi. Audit 2024-02: BLD-KH-001 foundation inspection complete.",
      repairHistory: "ASSET-004 (CNC Machine) repaired 5 times in last 3 months. High vibration reported repeatedly. Cost: ₹45,000."
    };

    try {
      const output = await aiAuditDiscrepancyAnalysis(input);
      setResult(output);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-accent" />
            AI Audit Analyst
          </h1>
          <p className="text-muted-foreground">Reasoning-powered engine for AMBIKA AMS to detect unusual wear and branch discrepancies.</p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          className="bg-primary text-white hover:bg-primary/90 shadow-lg px-8 py-6 h-auto text-lg font-bold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Logs...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>

      {!result && !isAnalyzing && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline">Ready for Deep Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-md">Click the button above to start the AI-powered audit. The system will cross-reference repair history, branch logs, and asset WDV records.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-xl border-t-4 border-t-accent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-2xl">Analysis Summary</CardTitle>
                <Badge variant={result.discrepanciesFound ? "destructive" : "default"}>
                  {result.discrepanciesFound ? "Anomalies Detected" : "Audit Clear"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-lg text-sm leading-relaxed border border-primary/10">
                {result.analysisSummary}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Recommended Actions
                </h4>
                <div className="grid gap-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-sm p-3 border rounded-md hover:bg-muted/30 transition-colors">
                      <div className="h-5 w-5 bg-accent/10 rounded flex items-center justify-center text-accent font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Flagged Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.flaggedAssets.length > 0 ? (
                <div className="space-y-3">
                  {result.flaggedAssets.map((id) => {
                    const asset = MOCK_ASSETS.find(a => a.id === id || a.serialNumber === id);
                    return (
                      <div key={id} className="p-3 border rounded-lg hover:border-orange-500 transition-colors cursor-pointer group">
                        <p className="text-sm font-bold group-hover:text-primary">{asset?.name || id}</p>
                        <p className="text-[10px] font-code text-muted-foreground uppercase">{id}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No assets flagged for investigation.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
