import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PatientFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export interface AnalysisResult {
  name: string;
  age: number;
  contactInfo: string;
  symptoms: string;
  diagnosis: string;
  recommendations: string;
}

const PatientForm = ({ onAnalysisComplete }: PatientFormProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !symptoms) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          symptoms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to analyze symptoms');
      }

      const analysis = await response.json();
      
      onAnalysisComplete({
        name,
        age: parseInt(age),
        contactInfo,
        symptoms,
        diagnosis: analysis.diagnosis,
        recommendations: analysis.recommendations,
      });

      toast.success("Symptoms analyzed successfully!");
      
      // Reset form
      setName("");
      setAge("");
      setContactInfo("");
      setSymptoms("");
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze symptoms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Patient</CardTitle>
        <CardDescription>
          Enter patient information and symptoms for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Patient Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="1"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              placeholder="Email or phone number"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms *</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe the symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              className="min-h-[120px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              "Analyze Symptoms"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;