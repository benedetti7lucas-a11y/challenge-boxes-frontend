import { Injectable, inject } from "@angular/core";
import {
  Observable,
  BehaviorSubject,
  catchError,
  of,
  tap,
  finalize,
  shareReplay,
  throwError,
  switchMap,
} from "rxjs";
import {
  CreateAppointmentRequest,
  Appointment,
  Workshop,
} from "../../models/appointment.model";
import { NotificationService } from "./notification.service";
import { AppointmentApiService } from "./appointment-api.service";

@Injectable({
  providedIn: "root",
})
export class AppointmentStateService {
  private readonly api = inject(AppointmentApiService);
  private readonly notificationService = inject(NotificationService);

  private readonly reloadWorkshops$ = new BehaviorSubject<void>(undefined);
  private readonly reloadAppointments$ = new BehaviorSubject<void>(undefined);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  private workshopsCache: Workshop[] = [];
  private appointmentsCache: Appointment[] = [];

  readonly workshops$: Observable<Workshop[]> = this.reloadWorkshops$.pipe(
    tap(() => this.setLoading(true)),
    switchMap(() =>
      this.api.getWorkshops().pipe(
        tap((workshops) => (this.workshopsCache = workshops)),
        catchError(() => {
          this.notificationService.error("Error al cargar talleres");
          return of([]);
        }),
        finalize(() => this.setLoading(false)),
      ),
    ),
    shareReplay(1),
  );

  readonly appointments$: Observable<Appointment[]> =
    this.reloadAppointments$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() =>
        this.api.getAppointments().pipe(
          tap((appointments) => (this.appointmentsCache = appointments)),
          catchError(() => {
            this.notificationService.error("Error al cargar citas");
            return of([]);
          }),
          finalize(() => this.setLoading(false)),
        ),
      ),
      shareReplay(1),
    );

  readonly loading$ = this.loadingSubject.asObservable();

  createAppointment(data: CreateAppointmentRequest): Observable<Appointment> {
    this.setLoading(true);
    return this.api.createAppointment(data).pipe(
      tap(() => {
        this.notificationService.success("¡Cita creada exitosamente!");
        this.reloadAppointments$.next();
      }),
      catchError((error) => throwError(() => error)),
      finalize(() => this.setLoading(false)),
    );
  }

  getWorkshopById(id: number): Workshop | undefined {
    return this.workshopsCache.find((w) => w.id === id);
  }

  refreshData(): void {
    this.reloadWorkshops$.next();
    this.reloadAppointments$.next();
  }

  reloadWorkshops(): void {
    this.reloadWorkshops$.next();
  }

  reloadAppointments(): void {
    this.reloadAppointments$.next();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
}
