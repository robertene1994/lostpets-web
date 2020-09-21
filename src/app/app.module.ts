import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');

import { AgmCoreModule } from '@agm/core';

import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService as MessageServicePrimeNG } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
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
import { JwPaginationComponent } from 'jw-angular-pagination';

import { TimeoutInterceptor } from './shared/interceptors/timeout/timeout.interceptor';
import { ErrorInterceptor } from './shared/interceptors/error/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt/jwt.interceptor';
import { AuthGuard } from './shared/guards/auth.guard';
import { ErrorHandlerService } from './shared/services/error-handler/error-handler.service';
import { NotificationsService } from './shared/services/notifications/notifications.service';
import { SpinnerService } from './shared/services/spinner/spinner.service';
import { UserService } from './shared/services/user/user.service';
import { AdService } from './shared/services/ad/ad.service';
import { ChatService } from './shared/services/chat/chat.service';
import { MessageService } from './shared/services/message/message.service';

import { googleMapsApiKey } from './app.config';

/**
 * Módulo principal de la aplicación.
 *
 * @author Robert Ene
 */
@NgModule({
    imports: [
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        AgmCoreModule.forRoot({
            apiKey: googleMapsApiKey
        }),
        ToastModule,
        TooltipModule,
        CalendarModule
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        SignupComponent,
        AdsComponent,
        AdDetailComponent,
        UserAdsComponent,
        UpdateAdComponent,
        AddAdComponent,
        UsersComponent,
        UserChatsComponent,
        UserProfileComponent,
        JwPaginationComponent
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es' },
        { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        MessageServicePrimeNG,
        AuthGuard,
        ErrorHandlerService,
        NotificationsService,
        SpinnerService,
        UserService,
        AdService,
        ChatService,
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
