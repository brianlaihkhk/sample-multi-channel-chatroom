import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Observable, SubscriptionLike, Subject, Observer, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

import { share, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { Message } from '../models';
import { ChannelService } from '.';

import { CryptoJS } from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

    private config: WebSocketSubjectConfig<Message>;

    private websocketSub: SubscriptionLike;
    private statusSub: SubscriptionLike;

    private reconnectionObserver: Observable<number>;
    private websocketSubject: WebSocketSubject<Message>;
    private connectionObserver: Observer<boolean>;
    private wsMessagesSubject: Subject<Message>;

    private reconnectInterval: number;
    private reconnectAttempts: number;
    private isConnected: boolean;

    private key : string;
    private channelId : string;

    public status: Observable<boolean>;

    constructor(channelId : string,
                private channelService: ChannelService) {
        this.channelId = channelId;
        this.channelService.getKey(this.channelId).pipe(map(key => this.key = key));

        this.wsMessagesSubject = new Subject<Message>();

        this.reconnectInterval = 5000; // pause between connections
        this.reconnectAttempts = 10; // number of connection attempts

        this.config = {
            url : '/chat/' + this.channelId,
            closeObserver: {
                next: (event: CloseEvent) => {
                    this.websocketSubject = null;
                    this.connectionObserver.next(false);
                }
            },
            openObserver: {
                next: (event: Event) => {
                    console.log('WebSocket connected!');
                    this.connectionObserver.next(true);
                }
            }
        };

        // connection status
        this.status = new Observable<boolean>((observer) => {
            this.connectionObserver = observer;
        }).pipe(share(), distinctUntilChanged());

        // run reconnect if not connection
        this.statusSub = this.status
            .subscribe((isConnected) => {
                this.isConnected = isConnected;

                if (!this.reconnectionObserver && typeof(isConnected) === 'boolean' && !isConnected) {
                    this.reconnect();
                }
            });

        this.websocketSub = this.wsMessagesSubject.subscribe(
            null, (error: ErrorEvent) => console.error('WebSocket error!', error)
        );

        this.connect();
    }

    ngOnDestroy() {
        this.websocketSub.unsubscribe();
        this.statusSub.unsubscribe();
    }

    /*
    * connect to WebSocked
    * */
    private connect(): void {
        this.websocketSubject = new WebSocketSubject(this.config);

        this.websocketSubject.subscribe(
            (message: Message) => this.wsMessagesSubject.next(message),
            (error: Event) => {
                if (!this.websocketSubject) {
                    // run reconnect if errors
                    this.reconnect();
                }
            });
    }


    /*
    * reconnect if not connecting or errors
    * */
    private reconnect(): void {

        this.channelService.getKey(this.channelId).pipe(map(key => this.key = key));

        this.reconnectionObserver = interval(this.reconnectInterval)
            .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.websocketSubject));

        this.reconnectionObserver.subscribe(
            () => this.connect(),
            null,
            () => {
                // Subject complete if reconnect attemts ending
                this.reconnectionObserver = null;

                if (!this.websocketSubject) {
                    this.wsMessagesSubject.complete();
                    this.connectionObserver.complete();
                }
            });
    }


    /*
    * on message event
    * */
    public onMessage(): Observable<Message> {
        return this.wsMessagesSubject.pipe(
            map((message: Message) => message)
        );
    }


    /*
    * on message to server
    * */
    public send(event: string, data: Message): void {
        if (event && this.isConnected) {
            this.websocketSubject.next(<any>JSON.stringify({ event, data }));
        } else {
            console.error('Send error!');
        }
    }

}