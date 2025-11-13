export interface FormattedAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  duration: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedAppointmentWithDetails extends FormattedAppointment {
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
}