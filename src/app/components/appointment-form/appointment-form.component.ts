import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
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
import { combineLatest, map, take } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

import { AppointmentStateService } from "../../services/appointment-state.service";
import { NotificationService } from "../../services/notification.service";
import { FormErrorHandlerService } from "../../services/form-error-handler.service";

import { CreateAppointmentRequest } from "../../../models/appointment.model";
import { APP_CONSTANTS } from "../../constants/app.constants";
import {
  AppointmentFormService,
  SERVICE_TYPES,
} from "./appointment-form.service";

@Component({
  selector: "app-appointment-form",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class AppointmentFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly formErrorHandler = inject(FormErrorHandlerService);
  private readonly formBuilder = inject(AppointmentFormService);

  appointmentForm!: FormGroup;

  isSubmitting = false;

  readonly serviceTypes = SERVICE_TYPES;
  readonly currentYear = APP_CONSTANTS.DATE.CURRENT_YEAR;
  readonly spinnerDiameter = APP_CONSTANTS.UI.SPINNER_DIAMETER;

  readonly workshopState$ = combineLatest([
    this.appointmentService.workshops$,
    this.appointmentService.loading$,
  ]).pipe(
    map(([workshops, loading]) => ({ workshops, loading })),
    takeUntilDestroyed(this.destroyRef),
  );

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.appointmentForm = this.formBuilder.createAppointmentForm();
  }

  private setupFormSubscriptions(): void {
    this.appointmentForm
      .get("hasVehicle")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasVehicle) => {
        this.formBuilder.updateVehicleValidations(
          this.appointmentForm,
          hasVehicle,
        );
      });

    const dateTimeControls = ["appointmentDate", "appointmentTime"];
    dateTimeControls.forEach((controlName) => {
      this.appointmentForm
        .get(controlName)
        ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.formErrorHandler.clearBackendErrors(
            this.appointmentForm,
            dateTimeControls,
          );
        });
    });
  }

  hasVehicle(): boolean {
    return this.appointmentForm?.get("hasVehicle")?.value || false;
  }

  shouldShowError(fieldName: string): boolean {
    const control = this.appointmentForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  hasBackendError(fieldName: string): boolean {
    return this.formErrorHandler.hasBackendError(
      this.appointmentForm,
      fieldName,
    );
  }

  getBackendError(fieldName: string): string {
    return this.formErrorHandler.getBackendError(
      this.appointmentForm,
      fieldName,
    );
  }

  onSubmit(): void {
    if (!this.canSubmitForm()) {
      this.markFormAsTouched();
      return;
    }

    this.isSubmitting = true;
    const appointmentData = this.buildAppointmentData();

    this.appointmentService
      .createAppointment(appointmentData)
      .pipe(take(1))
      .subscribe({
        next: () => this.handleSubmissionSuccess(),
        error: (error: HttpErrorResponse) => this.handleSubmissionError(error),
      });
  }

  private canSubmitForm(): boolean {
    return (
      this.formBuilder.isFormReadyForSubmission(this.appointmentForm) &&
      !this.isSubmitting
    );
  }

  private markFormAsTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach((key) => {
      this.appointmentForm.get(key)?.markAsTouched();
    });
  }

  private buildAppointmentData(): CreateAppointmentRequest {
    const formData = this.formBuilder.getFormData(this.appointmentForm);

    const appointmentData: CreateAppointmentRequest = {
      place_id: formData.place_id!,
      appointment_at: this.combineDateTime(
        formData.appointmentDate!,
        formData.appointmentTime,
      ),
      service_type: formData.service_type,
      contact: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
    };

    if (formData.hasVehicle && formData.make) {
      appointmentData.vehicle = {
        make: formData.make,
        model: formData.model,
        year: formData.year!,
        licensePlate: formData.license_plate,
      };
    }

    return appointmentData;
  }

  private combineDateTime(date: Date, time: string): string {
    if (!date || !time) return "";

    const dateObj = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj.toISOString();
  }

  private handleSubmissionSuccess(): void {
    this.router.navigate(["/appointments"]);
    this.isSubmitting = false;
  }

  private handleSubmissionError(error: HttpErrorResponse): void {
    const processedErrors = this.formErrorHandler.handleHttpFormErrors(
      error,
      this.appointmentForm,
    );

    if (processedErrors.length === 0) {
      this.notificationService.error(
        "Error al crear la cita. Por favor, intente nuevamente.",
      );
    }

    this.isSubmitting = false;
  }

  resetForm(): void {
    this.formBuilder.resetForm(this.appointmentForm);
  }
}
