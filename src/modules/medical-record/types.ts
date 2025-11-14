export interface FormattedMedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  chiefComplaint: string;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  treatment: string | null;
  bloodPressure: string | null;
  heartRate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedMedicalRecordWithDetails extends FormattedMedicalRecord {
  patient: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  appointment?: {
    id: string;
    date: string;
    status: string;
  };
}

