import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared/guards/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdsComponent } from './components/ads/ads.component';
import { AdDetailComponent } from './components/ad-detail/ad-detail.component';
import { UserAdsComponent } from './components/user-ads/user-ads.component';
import { UpdateAdComponent } from './components/update-ad/update-ad.component';
import { AddAdComponent } from './components/add-ad/add-ad.component';
import { UsersComponent } from './components/users/users.component';
import { UserChatsComponent } from './components/user-chats/user-chats.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

import { Role } from './shared/model/types/role';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'ads', component: AdsComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN, Role.USER] } },
    { path: 'ad-detail/:code', component: AdDetailComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN, Role.USER] } },
    { path: 'user-ads', component: UserAdsComponent, canActivate: [AuthGuard], data: { roles: [Role.USER] } },
    { path: 'update-ad/:code', component: UpdateAdComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN, Role.USER] } },
    { path: 'add-ad', component: AddAdComponent, canActivate: [AuthGuard], data: { roles: [Role.USER] } },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN] } },
    { path: 'user-chats', redirectTo: '/user-chats/', pathMatch: 'full' },
    { path: 'user-chats/:id', component: UserChatsComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN, Role.USER] } },
    { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard], data: { roles: [Role.ADMIN, Role.USER] } },
    { path: '**', redirectTo: '/login' }
];

/**
 * Módulo que define las rutas para las diferentes funcionalidades ofrecidas.
 *
 * @author Robert Ene
 */
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
