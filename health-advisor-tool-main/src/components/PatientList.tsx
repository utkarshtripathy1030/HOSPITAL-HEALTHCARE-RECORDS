import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Patient {
  id: string;
  name: string;
  age: number;
  contact_info: string | null;
  symptoms: string;
  diagnosis: string | null;
  recommendations: string | null;
  created_at: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error("Failed to load patient records");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Patient Records</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading patients...</p>
          ) : filteredPatients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No patients found matching your search" : "No patient records yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            Age {patient.age}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {patient.symptoms}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(patient.created_at)}
                        </div>
                      </div>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              Patient Record Details
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-lg">{selectedPatient.age} years</p>
                </div>
                {selectedPatient.contact_info && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <p className="text-lg">{selectedPatient.contact_info}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Recorded Date</p>
                <p>{formatDate(selectedPatient.created_at)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Symptoms</p>
                <p className="bg-muted p-3 rounded-md">{selectedPatient.symptoms}</p>
              </div>

              {selectedPatient.diagnosis && (
                <Alert>
                  <p className="text-sm font-medium mb-2">Assessment</p>
                  <AlertDescription>{selectedPatient.diagnosis}</AlertDescription>
                </Alert>
              )}

              {selectedPatient.recommendations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recommendations</p>
                  <div className="bg-secondary/10 p-4 rounded-md">
                    <p className="whitespace-pre-line text-sm">{selectedPatient.recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientList;