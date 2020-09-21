import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import * as Stomp from 'stompjs';

import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../user/user.service';

import { Message } from '../../model/message';

import {
    apiUrlMessage, messagingUrl,
    messagingUserDestination, messagingUserTopic
} from '../../../app.config';

/**
 * Servicio para las operaciones sobre los mensajes de los chats (`Message`).
 *
 * @author Robert Ene
 */
@Injectable({
    providedIn: 'root',
})
export class MessageService implements OnDestroy {

    private readonly CLIENT_HEARTBEAT_MILLIS = 1000;
    private readonly SERVER_HEARTBEAT_MILLIS = 1000;

    private stompClient: Stomp.Client;
    private userTopicSubscription: Stomp.Subscription;
    private messageSubject: Subject<Message>;
    private chatIsVisible: boolean;

    constructor(
        private http: HttpClient,
        private notificationsService: NotificationsService,
        private userService: UserService) {
        this.messageSubject = new Subject();
        this.chatIsVisible = false;
    }

    setChatIsVisible(chatIsVisible: boolean) {
        this.chatIsVisible = chatIsVisible;
    }

    getChatIsVisible() {
        return this.chatIsVisible;
    }

    async getChatMessages(code: string, userEmail: string): Promise<Message[]> {
        return await this.http.get<Message[]>(`${apiUrlMessage}/markAsRead/${code}`, {
            params: { userEmail }
        }).toPromise();
    }

    startMessagingConnection() {
        this.stompClient = Stomp.client(messagingUrl);
        this.stompClient.heartbeat.outgoing = this.CLIENT_HEARTBEAT_MILLIS;
        this.stompClient.heartbeat.incoming = this.SERVER_HEARTBEAT_MILLIS;
        this.stompClient.debug = () => { };
        this.stompClient.connect(this.addHeaders(), () => {
            this.initUserTopicSubscription();
        }, () => {
            this.notificationsService.showError('Chats',
                '¡Se ha perdido la conexión con el servidor! ¡Reconectando!');
            this.startMessagingConnection();
        });
    }

    stopMessagingConnection() {
        if (this.userTopicSubscription) {
            this.userTopicSubscription.unsubscribe();
        }
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect = () => { };
        }
    }

    getStompClient() {
        return this.stompClient;
    }

    getMessageSubject() {
        return this.messageSubject;
    }

    sendMessage(message: Message, email: string) {
        const destination = messagingUserDestination.replace('userEmail', email);
        this.stompClient.send(destination, {}, JSON.stringify(message));
    }

    ngOnDestroy(): void {
        this.stopMessagingConnection();
    }

    private addHeaders() {
        const headers: any = {};
        const token = this.userService.getToken();
        if (token) {
            headers.Authorization = `${JSON.parse(token)}`;
        }
        return headers;
    }

    private async initUserTopicSubscription() {
        const user = await this.userService.getLoggedUser();
        const topic = messagingUserTopic.replace('userEmail', user.email);
        this.userTopicSubscription = this.stompClient.subscribe(topic, (message: Stomp.Message) => {
            this.messageSubject.next(JSON.parse(message.body) as Message);
        });
    }
}
