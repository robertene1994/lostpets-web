import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../services/user/user.service';

import { Role } from '../model/types/role';
import { UserStatus } from './../model/types/user-status';

/**
 * Servicio para la autenticación (sesión iniciada) y autorización (rol) de los
 * usuarios de la aplicación para cada una de las rutas/pantallas disponibles.
 *
 * @author Robert Ene
 */
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private userService: UserService) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (route.data && route.data.roles) {
            const roles = route.data.roles as Role[];
            const user = await this.userService.getLoggedUser();

            if (this.userService.isUserLoggedIn()) {
                if (roles.includes(user.role)) {
                    if (user.status === UserStatus.ENABLED) {
                        return true;
                    } else {
                        this.router.navigate(['/login'], { queryParams: { userStatus: true } });
                        return false;
                    }
                } else {
                    this.router.navigate(['/login'], { queryParams: { roleNotAllowed: true } });
                    return false;
                }
            }
        }

        this.userService.logOut();
        this.router.navigate(['/']);
        return false;
    }
}
