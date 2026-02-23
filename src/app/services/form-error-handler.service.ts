import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  BackendErrorResponse,
  FormFieldError,
} from "../interfaces/form.interfaces";

const ERROR_FIELD_MAPPING: Record<string, string | string[]> = {
  AppointmentAt: ["appointmentTime", "appointmentDate"],
  PlaceId: "place_id",
  ServiceType: "service_type",
  "Contact.Name": "name",
  "Contact.Email": "email",
  "Contact.Phone": "phone",
  "Vehicle.Make": "make",
  "Vehicle.Model": "model",
  "Vehicle.Year": "year",
  "Vehicle.LicensePlate": "license_plate",
} as const;

@Injectable({
  providedIn: "root",
})
export class FormErrorHandlerService {
  handleHttpFormErrors(
    error: HttpErrorResponse,
    form: FormGroup,
  ): FormFieldError[] {
    if (error.status !== 400 || !error.error?.errors) {
      return [];
    }

    const backendErrors = error.error as BackendErrorResponse;
    const processedErrors: FormFieldError[] = [];

    Object.entries(backendErrors.errors).forEach(([backendField, messages]) => {
      const formFields = ERROR_FIELD_MAPPING[backendField];

      if (formFields && messages?.length > 0) {
        const errorMessage = messages[0];

        if (Array.isArray(formFields)) {
          formFields.forEach((field) => {
            this.setBackendError(form, field, errorMessage);
            processedErrors.push({
              field,
              message: errorMessage,
              type: "backend",
            });
          });
        } else {
          this.setBackendError(form, formFields, errorMessage);
          processedErrors.push({
            field: formFields,
            message: errorMessage,
            type: "backend",
          });
        }
      }
    });

    this.markFormAsTouched(form);
    return processedErrors;
  }

  clearBackendErrors(form: FormGroup, fieldNames: string[]): void {
    fieldNames.forEach((fieldName) => {
      const control = form.get(fieldName);
      if (control?.errors?.["backendError"]) {
        const { backendError, ...otherErrors } = control.errors;
        control.setErrors(
          Object.keys(otherErrors).length > 0 ? otherErrors : null,
        );
      }
    });
  }

  hasBackendError(form: FormGroup, fieldName: string): boolean {
    return !!form.get(fieldName)?.errors?.["backendError"];
  }

  getBackendError(form: FormGroup, fieldName: string): string {
    return form.get(fieldName)?.errors?.["backendError"] || "";
  }

  private setBackendError(
    form: FormGroup,
    fieldName: string,
    errorMessage: string,
  ): void {
    const control = form.get(fieldName);
    if (control) {
      control.setErrors({
        ...control.errors,
        backendError: errorMessage,
      });
    }
  }

  private markFormAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      form.get(key)?.markAsTouched();
    });
  }
}
