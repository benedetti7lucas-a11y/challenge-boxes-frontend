import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  CreateAppointmentRequest,
  Appointment,
  Workshop,
} from "../../models/appointment.model";
import { APP_CONSTANTS } from "../constants/app.constants";

@Injectable({
  providedIn: "root",
})
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  getWorkshops(): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(
      `${APP_CONSTANTS.API.BASE_URL}${APP_CONSTANTS.API.ENDPOINTS.WORKSHOPS}`,
    );
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${APP_CONSTANTS.API.BASE_URL}${APP_CONSTANTS.API.ENDPOINTS.APPOINTMENTS}`,
    );
  }

  createAppointment(data: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${APP_CONSTANTS.API.BASE_URL}${APP_CONSTANTS.API.ENDPOINTS.APPOINTMENTS}`,
      data,
    );
  }
}
