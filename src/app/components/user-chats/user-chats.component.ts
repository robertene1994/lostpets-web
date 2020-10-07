import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { CodeGeneratorUtil } from 'src/app/shared/utils/code-generator-util';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { ChatService } from '../../shared/services/chat/chat.service';
import { MessageService } from '../../shared/services/message/message.service';

import { User } from '../../shared/model/user';
import { Chat } from './../../shared/model/chat';
import { Message } from './../../shared/model/message';
import { MessageStatus } from 'src/app/shared/model/types/message-status';

/**
 * Componente que se encarga de manejar los chats pertenecientes a un determinado
 * usuario, además de los detalles de cada uno de los chats.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-user-chats',
    templateUrl: './user-chats.component.html',
    styleUrls: ['./user-chats.component.css'],
})
export class UserChatsComponent implements OnInit, OnDestroy {
    private user: User;

    private userChats: Chat[];
    private selectedChat: Chat & { isNew?: boolean };

    private messages: Message[];
    private message: Message;
    private messageSubject: Subject<Message>;
    private messageSubscription: Subscription;

    constructor(
        private title: Title,
        private location: Location,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private chatService: ChatService,
        private messageService: MessageService
    ) {}

    async ngOnInit() {
        this.title.setTitle('LostPets: Chats');
        this.spinnerService.showSpinner();
        this.messageService.setChatIsVisible(true);
        this.user = await this.userService.getLoggedUser();
        await this.getUserChats();
        await this.checkQueryParams();
        this.initMessage();
        this.initSubscription();
        this.spinnerService.hideSpinner();
    }

    async getUserChats() {
        if (this.user) {
            const userChats = await this.chatService.getUserChats(this.user.id).catch((err) => this.errorHandlerService.handleError(err));
            if (userChats) {
                this.userChats = userChats;
                if (this.userChats.length === 0) {
                    this.notificationsService.showInfo('Chats', '¡No existen chats!');
                }
            }
        }
    }

    async loadChatMessages(chat: Chat & { isNew?: boolean }) {
        this.location.replaceState(`user-chats/${chat.code}`);
        this.selectedChat = chat;
        const messages = await this.messageService
            .getChatMessages(this.selectedChat.code, this.user.email)
            .catch((err) => this.errorHandlerService.handleError(err));
        if (messages) {
            this.messages = messages;
        }
        this.message.toUser = this.selectedChat.toUser;
        this.message.chat = this.selectedChat;
        this.scrollDownChatMessages();
    }

    closeChatDetail() {
        this.location.replaceState(`user-chats/`);
        this.selectedChat = undefined;
        this.messages = undefined;
        this.message.toUser = undefined;
        this.message.chat = undefined;
    }

    async sendMessage() {
        if (this.checkValidMessage()) {
            this.message.content = this.message.content.trim();
            this.message.code = CodeGeneratorUtil.random();
            this.message.date = new Date().getTime();
            this.messages.push(Object.assign({}, this.message));

            this.messageService.sendMessage(this.message, this.message.toUser.email);

            this.message.content = undefined;
            this.scrollDownChatMessages();
            this.autoGrowTextArea();

            const userChats = await this.chatService.getUserChats(this.user.id).catch((err) => this.errorHandlerService.handleError(err));
            if (userChats) {
                this.userChats = userChats;
                if (this.selectedChat.isNew) {
                    this.selectedChat = this.userChats.find((c) => c.code === this.selectedChat.code);
                }
            }
        }
    }

    sendMessageButtonState() {
        return !this.checkValidMessage();
    }

    ngOnDestroy(): void {
        this.messageService.setChatIsVisible(false);
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }

    private scrollDownChatMessages() {
        const scrollDown = setInterval(() => {
            const chatMessagesWrapper = document.getElementById('chat-messages-wrapper');
            if (chatMessagesWrapper !== null) {
                chatMessagesWrapper.scrollTop = chatMessagesWrapper.scrollHeight;
                clearInterval(scrollDown);
            }
        }, 100);
    }

    private initMessage() {
        this.message = new Message();
        this.message.messageStatus = MessageStatus.SENT;
        this.message.fromUser = this.user;
    }

    private initSubscription() {
        this.messageSubject = this.messageService.getMessageSubject();
        if (this.messageSubject) {
            this.messageSubscription = this.messageSubject.subscribe((message) => {
                this.processMessage(message);
                this.scrollDownChatMessages();
            });
        }
    }

    private processMessage(message: Message) {
        if (this.selectedChat && this.selectedChat.code === message.chat.code) {
            if (this.selectedChat.fromUser.id === message.toUser.id && message.messageStatus === MessageStatus.SENT) {
                this.addMessageToChat(message);

                message.messageStatus = MessageStatus.DELIVERED;
                this.messageService.sendMessage(message, this.selectedChat.toUser.email);

                setTimeout(() => {
                    message.messageStatus = MessageStatus.READ;
                    this.messageService.sendMessage(message, this.selectedChat.toUser.email);
                }, 500);
            } else {
                this.updadeMessageStatus(message);
            }
        } else {
            if (message.messageStatus === MessageStatus.SENT) {
                message.messageStatus = MessageStatus.DELIVERED;
                this.messageService.sendMessage(message, message.fromUser.email);
                this.notificationsService.showMessage(
                    `${message.fromUser.lastName}
                    ${message.fromUser.firstName}`,
                    message.content
                );
            }
        }
        setTimeout(() => {
            this.getUserChats();
        }, 1000);
    }

    private addMessageToChat(message: Message) {
        if (this.messages.findIndex((m) => m.code === message.code) === -1) {
            this.messages.push(Object.assign({}, message));
            this.scrollDownChatMessages();
        }
    }

    private updadeMessageStatus(message: Message) {
        const messageIndex = this.messages.findIndex((m) => m.code === message.code);
        if (messageIndex !== -1) {
            this.messages[messageIndex].messageStatus = message.messageStatus;
        }
    }

    private checkValidMessage() {
        if (!this.message || !this.message.content || this.message.content.trim().length === 0) {
            return false;
        }
        return true;
    }

    private autoGrowTextArea() {
        setTimeout(() => {
            const textArea = document.getElementById('send-message-text-area');
            textArea.style.height = '0px';
            textArea.style.height = textArea.scrollHeight === 36 ? '38px' : textArea.scrollHeight + 'px';
        }, 100);
    }

    async checkForOpenChat(id: number) {
        let chat: Chat & { isNew?: boolean } = this.userChats.find((c) => c.toUser.id === id);
        if (!chat) {
            chat = new Chat();
            chat.code = CodeGeneratorUtil.random();
            chat.unreadMessages = 0;
            chat.isNew = true;
            chat.fromUser = this.user;
            const toUser = await this.userService.getUserById(id).catch((err) => this.errorHandlerService.handleError(err));
            if (toUser) {
                chat.toUser = toUser;
            }
        }
        this.location.replaceState(`user-chats/${chat.code}`);
        this.loadChatMessages(chat);
    }

    private async checkQueryParams() {
        const id = this.route.snapshot.params.id;
        if (id && id !== null && !isNaN(id) && this.user.id !== Number(id)) {
            await this.checkForOpenChat(Number(id));
        }
    }

    private isToday(time: number) {
        const date = new Date(time);
        const now = new Date();
        return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
}
