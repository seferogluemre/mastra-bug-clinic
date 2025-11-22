export interface FormattedDoctor {
  id: string;
  name: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedDoctorWithStats extends FormattedDoctor {
  upcomingAppointments: number;
  totalPatients: number;
  todayAppointments: number;
}

