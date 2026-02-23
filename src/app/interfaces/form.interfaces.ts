import { FormControl, ValidationErrors } from "@angular/forms";

export interface AppointmentFormData {
  place_id: number | null;
  appointmentDate: Date | null;
  appointmentTime: string;
  service_type: string;
  name: string;
  email: string;
  phone: string;
  hasVehicle: boolean;
  make: string;
  model: string;
  year: number | null;
  license_plate: string;
}

export interface BackendValidationError {
  [fieldName: string]: string[];
}

export interface BackendErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: BackendValidationError;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors | null;
}

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  panelClass?: string[];
}

export interface FormFieldError {
  field: string;
  message: string;
  type: "backend" | "validation";
}
