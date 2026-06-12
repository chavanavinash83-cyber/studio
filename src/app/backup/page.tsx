"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Loader2, ShieldCheck, FileJson, AlertCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const COLLECTIONS_TO_BACKUP = [
  "assets",
  "branches",
  "categories",
  "departments",
  "firms",
  "maintenance",
  "transfers",
  "vendors",
  "users"
];

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleDownloadBackup = async () => {
    if (!db) return;

    setIsExporting(true);
    const backupData: Record<string, any[]> = {};

    try {
      toast({
        title: "Backup Started",
        description: "Fetching all enterprise records from the cloud...",
      });

      for (const colName of COLLECTIONS_TO_BACKUP) {
        const querySnapshot = await getDocs(collection(db, colName));
        backupData[colName] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
      }

      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
      const fileName = `AMBIKA_AMS_Backup_${timestamp}.json`;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Successful",
        description: `Archive saved as ${fileName}`,
      });
    } catch (error) {
      console.error("Backup failed", error);
      toast({
        variant: "destructive",
        title: "Backup Failed",
        description: "Could not retrieve all data. Check your connection or permissions.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-3">
          <Database className="h-8 w-8 text-accent" />
          Data Backup & Archive
        </h1>
        <p className="text-muted-foreground">Download a secure snapshot of your entire enterprise database.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Full System Snapshot
            </CardTitle>
            <CardDescription>
              This will generate a JSON file containing all master records, asset logs, and user data currently stored in your AMBIKA AMS cloud.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-xl border border-dashed flex items-start gap-4">
              <div className="p-2 bg-background rounded-lg border">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-sm space-y-1">
                <p className="font-bold text-foreground">Included Collections:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLLECTIONS_TO_BACKUP.map(c => (
                    <span key={c} className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-800 leading-relaxed">
                <p className="font-bold mb-1 uppercase tracking-tight">Security Notice</p>
                Backup files contain sensitive organizational data. Ensure downloaded files are stored in an encrypted location and never shared via insecure channels.
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg"
              onClick={handleDownloadBackup}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating Archive...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-6 w-6" />
                  Download Complete Data Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Standard Operating Procedures</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-3">
            <p>1. It is recommended to perform a backup before major data entry or audit cycles.</p>
            <p>2. AMBIKA AMS automatically creates daily snapshots in the cloud, but manual backups provide an additional layer of local redundancy.</p>
            <p>3. The generated JSON file can be imported back into the system in the event of accidental record deletion by contacting the IT Admin team.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
