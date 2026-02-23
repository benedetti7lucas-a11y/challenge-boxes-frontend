import { Routes } from "@angular/router";
import { AppointmentListComponent } from "./components/appointment-list/appointment-list.component";
import { AppointmentFormComponent } from "./components/appointment-form/appointment-form.component";

export const routes: Routes = [
  { path: "", redirectTo: "/appointments", pathMatch: "full" },
  { path: "appointments", component: AppointmentListComponent },
  { path: "appointments/new", component: AppointmentFormComponent },
  { path: "**", redirectTo: "/appointments" },
];
