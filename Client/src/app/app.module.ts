import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { ChatComponent, ChatroomChannelComponent, ChatroomChatComponent, ChatroomUserComponent } from './chat';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    RegisterComponent,
    ChatComponent,
    ChatroomChannelComponent,
    ChatroomChatComponent,
    ChatroomUserComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
