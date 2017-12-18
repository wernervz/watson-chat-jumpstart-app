import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Conversation } from './conversation.class';
import { LoopbackLoginService } from '../../auth/loopback/lb-login.service';

@Injectable()
export class ConversationService {

  constructor(private authSvc:LoopbackLoginService) { }

  sendMessage(conversation:Conversation) {
    return this.authSvc.makeAuthenticatedHttpJsonPost('api/Conversation/sendMessage', conversation);
  }
}
