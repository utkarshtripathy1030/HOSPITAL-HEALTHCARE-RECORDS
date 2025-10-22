import { useState } from "react";
import PatientForm, { AnalysisResult as AnalysisResultType } from "@/components/PatientForm";
import AnalysisResult from "@/components/AnalysisResult";
import PatientList from "@/components/PatientList";
import { Activity, FileHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalysisComplete = (result: AnalysisResultType) => {
    setAnalysisResult(result);
  };

  const handleSavePatient = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('patients').insert({
        name: analysisResult.name,
        age: analysisResult.age,
        contact_info: analysisResult.contactInfo || null,
        symptoms: analysisResult.symptoms,
        diagnosis: analysisResult.diagnosis,
        recommendations: analysisResult.recommendations,
      });

      if (error) throw error;

      toast.success("Patient profile saved successfully!");
      setAnalysisResult(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error("Failed to save patient profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <FileHeart className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Medical Analysis System
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-Powered Patient Symptom Analysis & Management
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            {!analysisResult ? (
              <PatientForm onAnalysisComplete={handleAnalysisComplete} />
            ) : (
              <AnalysisResult
                {...analysisResult}
                onSave={handleSavePatient}
                isSaving={isSaving}
              />
            )}
          </div>

          <div>
            <PatientList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
