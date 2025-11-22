export interface FormattedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedPrescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId: string | null;
  diagnosis: string | null;
  notes: string | null;
  validUntil: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedPrescriptionWithDetails extends FormattedPrescription {
  patient: {
    id: string;
    name: string;
    phone: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  medications: FormattedMedication[];
}

