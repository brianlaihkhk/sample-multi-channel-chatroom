import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Channel , ChannelFilter } from '../models';
import { map } from 'rxjs/operators';

@Injectable()
export class ChannelService {
    constructor (
        private apiService: ApiService
    ) {}

    query(config: ChannelFilter): Observable<Channel[]> {
        // Convert any filters over to Angular's URLSearchParams
        const params = {};

        Object.keys(config)
            .forEach((key) => {
                params[key] = config[key];
            });

        return this.apiService.get('/channel',
                new HttpParams({ fromObject: params }))
                .pipe(map(data => data.channels));
    }

    destroy(channelId : string) {
        return this.apiService.delete('/channel/' + channelId);
    }

    create(channelId : string) : Observable<Channel> {
        return this.apiService.post('/channel/' + channelId)
        .pipe(map(data => data.channel));
    }

    save(channelId : string): Observable<Channel> {
        return this.apiService.put('/channel/' + channelId)
            .pipe(map(data => data.channel));
    }

    addUser(channelId : string, userId : string) : Observable<Channel> {
        return this.apiService.post('/channel/' + channelId + '/' + userId)
        .pipe(map(data => data.channel));
    }

    deleteUser(channelId : string, userId : string) : Observable<Channel> {
        return this.apiService.delete('/channel/' + channelId + '/' + userId)
        .pipe(map(data => data.channel));
    }

    getKey(channelId : string): Observable<string> {
        return this.apiService.get('/key/' + channelId)
                .pipe(map(data => data.channel));
    }
}
