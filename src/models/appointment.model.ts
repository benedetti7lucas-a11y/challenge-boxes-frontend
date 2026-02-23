export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface Workshop {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface Appointment {
  appointmentId?: string;
  placeId: number;
  appointmentAt: string;
  serviceType: string;
  workshopName?: string;
  contact: Contact;
  vehicle?: Vehicle;
  createdAt?: string;
  workshop?: Workshop;
}

export interface CreateAppointmentRequest {
  place_id: number;
  appointment_at: string;
  service_type: string;
  contact: Contact;
  vehicle?: Vehicle;
}
