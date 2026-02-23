import { Injectable, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppointmentFormData } from "../../interfaces/form.interfaces";

export const SERVICE_TYPES = [
  "Mantención General",
  "Cambio de Aceite",
  "Revisión de Frenos",
  "Alineación y Balanceo",
  "Revisión Técnica",
  "Reparación de Motor",
  "Otros",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

@Injectable({
  providedIn: "root",
})
export class AppointmentFormService {
  private readonly fb = inject(FormBuilder);

  createAppointmentForm(): FormGroup<any> {
    return this.fb.group({
      place_id: [null, [Validators.required]],
      appointmentDate: [null, [Validators.required]],
      appointmentTime: ["", [Validators.required]],
      service_type: ["", [Validators.required]],
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      hasVehicle: [false],
      make: [""],
      model: [""],
      year: [null],
      license_plate: [""],
    });
  }

  updateVehicleValidations(form: FormGroup, hasVehicle: boolean): void {
    const makeControl = form.get("make");
    const modelControl = form.get("model");
    const yearControl = form.get("year");
    const licensePlateControl = form.get("license_plate");

    if (hasVehicle) {
      makeControl?.setValidators([Validators.required]);
      modelControl?.setValidators([Validators.required]);
      yearControl?.setValidators([Validators.required]);
    } else {
      makeControl?.clearValidators();
      modelControl?.clearValidators();
      yearControl?.clearValidators();
      licensePlateControl?.clearValidators();

      makeControl?.setValue("");
      modelControl?.setValue("");
      yearControl?.setValue(null);
      licensePlateControl?.setValue("");
    }

    makeControl?.updateValueAndValidity();
    modelControl?.updateValueAndValidity();
    yearControl?.updateValueAndValidity();
    licensePlateControl?.updateValueAndValidity();
  }

  getFormData(form: FormGroup): AppointmentFormData {
    return {
      place_id: form.get("place_id")?.value,
      appointmentDate: form.get("appointmentDate")?.value,
      appointmentTime: form.get("appointmentTime")?.value,
      service_type: form.get("service_type")?.value,
      name: form.get("name")?.value?.trim(),
      email: form.get("email")?.value?.trim().toLowerCase(),
      phone: form.get("phone")?.value?.trim(),
      hasVehicle: form.get("hasVehicle")?.value,
      make: form.get("make")?.value?.trim(),
      model: form.get("model")?.value?.trim(),
      year: form.get("year")?.value,
      license_plate: form.get("license_plate")?.value?.trim().toUpperCase(),
    };
  }

  isFormReadyForSubmission(form: FormGroup): boolean {
    return form.valid && !form.pending;
  }

  resetForm(form: FormGroup): void {
    form.reset();
    form.get("hasVehicle")?.setValue(false);
    this.updateVehicleValidations(form, false);
  }
}
