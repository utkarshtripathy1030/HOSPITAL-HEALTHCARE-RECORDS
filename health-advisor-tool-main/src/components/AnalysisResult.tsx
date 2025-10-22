import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnalysisResultProps {
  name: string;
  age: number;
  contactInfo: string;
  symptoms: string;
  diagnosis: string;
  recommendations: string;
  onSave: () => void;
  isSaving: boolean;
}

const AnalysisResult = ({
  name,
  age,
  contactInfo,
  symptoms,
  diagnosis,
  recommendations,
  onSave,
  isSaving,
}: AnalysisResultProps) => {
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{name}</CardTitle>
            <CardDescription>
              Age: {age} {contactInfo && `• ${contactInfo}`}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            Analysis Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Reported Symptoms
          </h3>
          <p className="text-muted-foreground bg-muted p-3 rounded-md">{symptoms}</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preliminary Assessment</AlertTitle>
          <AlertDescription className="mt-2">{diagnosis}</AlertDescription>
        </Alert>

        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            Health Recommendations
          </h3>
          <div className="bg-secondary/10 p-4 rounded-md">
            <p className="whitespace-pre-line text-sm leading-relaxed">{recommendations}</p>
          </div>
        </div>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            This analysis is for informational purposes only and does not constitute medical advice. 
            Please consult with a qualified healthcare professional for proper diagnosis and treatment.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={onSave} 
          className="w-full"
          size="lg"
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Patient Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;