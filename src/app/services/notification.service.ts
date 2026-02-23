import { Injectable, inject } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarRef,
  SimpleSnackBar,
} from "@angular/material/snack-bar";
import { NotificationConfig } from "../interfaces/form.interfaces";
import { APP_CONSTANTS } from "../constants/app.constants";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action = "Cerrar"): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration: APP_CONSTANTS.UI.SNACKBAR_DURATION,
      panelClass: ["success-snackbar"],
    });
  }

  error(message: string, action = "Cerrar"): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration: APP_CONSTANTS.UI.SNACKBAR_ERROR_DURATION,
      panelClass: ["error-snackbar"],
    });
  }

  info(message: string, action = "Cerrar"): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration: APP_CONSTANTS.UI.SNACKBAR_DURATION,
      panelClass: ["info-snackbar"],
    });
  }

  warning(message: string, action = "Cerrar"): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration: APP_CONSTANTS.UI.SNACKBAR_DURATION,
      panelClass: ["warning-snackbar"],
    });
  }

  show(config: NotificationConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(config.message, config.action || "Cerrar", {
      duration: config.duration || APP_CONSTANTS.UI.SNACKBAR_DURATION,
      panelClass: config.panelClass || [],
    });
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
}
