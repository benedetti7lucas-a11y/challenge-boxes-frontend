import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { Observable, combineLatest, map } from "rxjs";
import { AppointmentStateService } from "../../services/appointment-state.service";
import { Appointment } from "../../../models/appointment.model";

@Component({
  selector: "app-appointment-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: "./appointment-list.component.html",
  styleUrls: ["./appointment-list.component.scss"],
})
export class AppointmentListComponent {
  readonly appointmentService = inject(AppointmentStateService);

  readonly appointmentState$ = combineLatest([
    this.appointmentService.appointments$,
    this.appointmentService.loading$,
  ]).pipe(map(([appointments, loading]) => ({ appointments, loading })));

  readonly displayedColumns: string[] = [
    "datetime",
    "workshop",
    "serviceType",
    "client",
    "vehicle",
  ];

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
