import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { combineLatest, map } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { AppointmentService } from "../../../services/appointment.service";
import { CreateAppointmentRequest } from "../../../models/appointment.model";

@Component({
  selector: "app-appointment-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./appointment-form.component.html",
  styleUrls: ["./appointment-form.component.scss"],
})
export class AppointmentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly appointmentService = inject(AppointmentService);

  readonly workshopState$ = combineLatest([
    this.appointmentService.workshops$,
    this.appointmentService.loading$,
  ]).pipe(map(([workshops, loading]) => ({ workshops, loading })));

  readonly currentYear = new Date().getFullYear();

  appointmentForm!: FormGroup;
  isSubmitting = false;

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      place_id: [null, [Validators.required]],
      appointmentDate: [null, [Validators.required]],
      appointmentTime: ["", [Validators.required]],
      service_type: ["", [Validators.required]],
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      hasVehicle: [false],
      make: [""],
      model: [""],
      year: [null],
      license_plate: [""],
    });

    this.setupDateTimeErrorClearing();
  }

  private setupDateTimeErrorClearing(): void {
    const dateControl = this.appointmentForm.get("appointmentDate");
    const timeControl = this.appointmentForm.get("appointmentTime");

    dateControl?.valueChanges.subscribe(() => {
      this.clearBackendErrors(["appointmentDate", "appointmentTime"]);
    });

    timeControl?.valueChanges.subscribe(() => {
      this.clearBackendErrors(["appointmentDate", "appointmentTime"]);
    });
  }

  private clearBackendErrors(fieldNames: string[]): void {
    fieldNames.forEach((fieldName) => {
      const control = this.appointmentForm.get(fieldName);
      const errors = control?.errors;

      if (errors?.["backendError"]) {
        const { backendError, ...otherErrors } = errors;
        const hasOtherErrors = Object.keys(otherErrors).length > 0;

        control?.setErrors(hasOtherErrors ? otherErrors : null);
      }
    });
  }

  hasVehicle(): boolean {
    return this.appointmentForm?.get("hasVehicle")?.value || false;
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.appointmentForm.value;

      const appointmentData: CreateAppointmentRequest = {
        place_id: formValue.place_id,
        appointment_at: this.combineDateTime(),
        service_type: formValue.service_type,
        contact: {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
        },
      };

      if (this.hasVehicle() && formValue.make) {
        appointmentData.vehicle = {
          make: formValue.make,
          model: formValue.model,
          year: formValue.year,
          licensePlate: formValue.license_plate,
        };
      }

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.router.navigate(["/appointments"]);
          this.isSubmitting = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleFormErrors(error);
          this.isSubmitting = false;
        },
      });
    }
  }

  private handleFormErrors(error: HttpErrorResponse): void {
    if (error.status === 400 && error.error?.errors) {
      const errors = error.error.errors;

      if (errors.AppointmentAt) {
        this.appointmentForm.get("appointmentTime")?.setErrors({
          backendError: errors.AppointmentAt[0],
        });
        this.appointmentForm.get("appointmentDate")?.setErrors({
          backendError: errors.AppointmentAt[0],
        });
      }

      if (errors.PlaceId) {
        this.appointmentForm.get("place_id")?.setErrors({
          backendError: errors.PlaceId[0],
        });
      }

      if (errors.ServiceType) {
        this.appointmentForm.get("service_type")?.setErrors({
          backendError: errors.ServiceType[0],
        });
      }

      Object.keys(this.appointmentForm.controls).forEach((key) => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
    }
  }

  private combineDateTime(): string {
    const date = this.appointmentForm.get("appointmentDate")?.value;
    const time = this.appointmentForm.get("appointmentTime")?.value;

    if (!date || !time) return "";

    const dateObj = new Date(date);
    const [hours, minutes] = time.split(":");
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return dateObj.toISOString();
  }
}
