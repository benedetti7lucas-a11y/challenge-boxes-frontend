import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  Observable,
  BehaviorSubject,
  catchError,
  of,
  tap,
  finalize,
  defer,
  shareReplay,
} from "rxjs";
import {
  CreateAppointmentRequest,
  Appointment,
  Workshop,
} from "../models/appointment.model";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly API_BASE_URL = "http://localhost:5000/api";

  // Estado local usando BehaviorSubjects
  private workshopsSubject = new BehaviorSubject<Workshop[]>([]);
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Exponer observables públicos con carga lazy
  readonly workshops$ = defer(() => {
    if (this.workshopsSubject.value.length === 0) {
      this.loadWorkshops();
    }
    return this.workshopsSubject.asObservable();
  }).pipe(shareReplay(1));

  readonly appointments$ = defer(() => {
    if (this.appointmentsSubject.value.length === 0) {
      this.loadAppointments();
    }
    return this.appointmentsSubject.asObservable();
  }).pipe(shareReplay(1));

  readonly loading$ = this.loadingSubject.asObservable();

  private loadWorkshops(): void {
    this.setLoading(true);
    this.http
      .get<Workshop[]>(`${this.API_BASE_URL}/workshops`)
      .pipe(
        catchError((error) => {
          const errorMessage = this.getErrorMessage(error);
          this.showErrorSnackBar("Error al cargar talleres", errorMessage);
          return of([]);
        }),
        finalize(() => this.setLoading(false)),
      )
      .subscribe((workshops) => {
        this.workshopsSubject.next(workshops);
      });
  }

  private loadAppointments(): void {
    this.setLoading(true);
    this.http
      .get<Appointment[]>(`${this.API_BASE_URL}/appointments`)
      .pipe(
        catchError((error) => {
          const errorMessage = this.getErrorMessage(error);
          this.showErrorSnackBar("Error al cargar citas", errorMessage);
          return of([]);
        }),
        finalize(() => this.setLoading(false)),
      )
      .subscribe((appointments) => {
        this.appointmentsSubject.next(appointments);
      });
  }

  createAppointment(
    appointmentData: CreateAppointmentRequest,
  ): Observable<Appointment> {
    this.setLoading(true);
    return this.http
      .post<Appointment>(`${this.API_BASE_URL}/appointments`, appointmentData)
      .pipe(
        tap((appointment) => {
          const currentAppointments = this.appointmentsSubject.value;
          this.appointmentsSubject.next([...currentAppointments, appointment]);

          this.snackBar.open("¡Cita creada exitosamente!", "Cerrar", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        }),
        catchError((error) => {
          const errorMessage = this.getErrorMessage(error);
          this.showErrorSnackBar("Error al crear la cita", errorMessage);
          throw error;
        }),
        finalize(() => this.setLoading(false)),
      );
  }

  getWorkshopById(id: number): Workshop | undefined {
    return this.workshopsSubject.value.find((workshop) => workshop.id === id);
  }

  refreshData(): void {
    this.loadWorkshops();
    this.loadAppointments();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getErrorMessage(error: any): string {
    return error?.error?.message || error?.message || "Error desconocido";
  }

  private showErrorSnackBar(message: string, errorMessage: string): void {
    this.snackBar.open(`${message}: ${errorMessage}`, "Cerrar", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    });
  }
}
