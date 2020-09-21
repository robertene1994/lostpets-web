import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Chat } from '../../model/chat';

import { apiUrlChat } from 'src/app/app.config';

/**
 * Servicio para las operaciones sobre los chats (`Chat`).
 *
 * @author Robert Ene
 */
@Injectable()
export class ChatService {

    constructor(
        private http: HttpClient) { }

    async getUserChats(id: number): Promise<Chat[]> {
        return await this.http.get<Chat[]>(`${apiUrlChat}/user/${id}`).toPromise();
    }
}
