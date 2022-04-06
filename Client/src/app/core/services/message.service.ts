import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Message, MessageFilter } from '../models';
import { map } from 'rxjs/operators';

@Injectable()
export class MessageService {
    constructor (
        private apiService: ApiService
    ) {}

    query(channelId : string, config: MessageFilter): Observable<Message[]> {
        // Convert any filters over to Angular's URLSearchParams
        const params = {};

        Object.keys(config)
            .forEach((key) => {
            params[key] = config[key];
            });

        return this.apiService.get('/message/' + channelId,
                new HttpParams({ fromObject: params }))
                .pipe(map(data => data.messages));
    }
}
