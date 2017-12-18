import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { Utterance } from './utterance.class';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.class';
import { ToneService } from './tone.service';
import { ActionHandlerService } from './action-handler.service';

@Injectable()
export class ChatControlService {
  
  // Used to control that the chat is only initialized once.
  initialized:boolean = false;

  // Controls whether the chat control is shown or not.
  chatState:string = 'hide';
  chatStateObserver:BehaviorSubject<string> = new BehaviorSubject('hide');

  // The conversation context to be passed back to WCS on subsequent calls.
  context:any;

  // Used to notify any subscribers when a new uttenrance is added to the conversation.
  conversationObserver:Subject<Utterance> = new Subject();
  // An array of utterances as the conversation progress.
  conversation:Array<Utterance> = new Array();

  // Used to notify any subscribers when a new tone is received.
  toneObserver:Subject<string> = new Subject();

  // Config params received from the conversation's Welcome response.  
  // Used to control what else is included in the calls.
  isToneEnabled:boolean = false;
  
  constructor(private conversationSvc:ConversationService, private toneSvc:ToneService, private actionHandlerSvc: ActionHandlerService) { }

  // Refresh the Conversation and start over.
  refreshConversation() {
    this.conversation = new Array();
    this.context = null;
    this.initialized = false;
    this.toneObserver.next('refresh')
    this.callConversation('').subscribe(conversationResp => {
      this.addWatsonUtterance(conversationResp.output.text);
    })
  }

  // Add a Watson Utterance to the transcript
  addWatsonUtterance(message, type?) {
    let watsonUtterance = new Utterance(message, 'watson', type);
    this.conversationObserver.next(watsonUtterance);
    this.conversation.push(watsonUtterance)
  }

  // Add a Human utterance to the transcript
  addHumanUtterance(message) {
    let humanUtterance = new Utterance(message, 'human')
    this.conversationObserver.next(humanUtterance)
    this.conversation.push(humanUtterance)
    // If tone is enabled for this app, then call tone first.  Enable tone in your welcome dialog node response.
    if (this.isToneEnabled) {
      this.toneSvc.chatAnalysis(this.conversation).subscribe(toneResp => {
        // When tone is enabled, add the results of the Tone analysis to the context sent back to Conversation.
        if (toneResp.utterances_tone[toneResp.utterances_tone.length - 1].tones.length > 0) {
          this.context.customer_tone = this.toneSvc.getHighestTone(toneResp.utterances_tone[toneResp.utterances_tone.length - 1].tones).tone_id;
        }
        this.postHumanUtteranceActions(message, toneResp)
      })
    } else {
      this.postHumanUtteranceActions(message)
    }
  }

  // Do this after a human utterance was added to the transcript.  Basically call conversation for a Watson response.
  postHumanUtteranceActions(message, toneResp?) {
    this.callConversation(message).subscribe((conversationResp) => {
      this.addWatsonUtterance(conversationResp.output.text);      
      if (toneResp) {
        this.mergeConversationAndToneAnalysis(toneResp)        
      }
      if (conversationResp.output.action) {
        this.actionHandlerSvc.executeAction(conversationResp, this.conversation).subscribe((actionUtternance) => {
          // Remove the waiting utterance
          this.conversation.pop()
          // Add the action response to the chat transcript
          this.conversationObserver.next(actionUtternance);
          this.conversation.push(actionUtternance)
        })
      }
    })
  }

  // Called from the chat bubble to display the next item in something like a Discovery Response.
  nextItem() {
    this.actionHandlerSvc.nextItem().subscribe(utterance => {
      this.conversationObserver.next(utterance);
      this.conversation.push(utterance)
    })
  }

  // Call Watson conversation wrapper function
  callConversation(message):Observable<any> {
    this.addWatsonUtterance('<i class="fa fa-spinner fa-pulse fa-lg fa-fw"></i>', 'html')
    return this.conversationSvc.sendMessage(new Conversation(message, this.context)).map(response => {
      // Set Tone calls to enabled on the conversation welcome response.
      if (!this.initialized) {
        this.isToneEnabled = response.output.isToneEnabled ? response.output.isToneEnabled : false;
      }
      this.initialized = true;
      this.context = response.context;
      this.conversation.pop();
      // If there is an action specificied in the response, execute it now...
      return response
    })
  }

  // Returns the Subscription to be notified when an Utterance is added to the transcript.
  onUtterance() {
    return this.conversationObserver;
  }

  // Returns the Subscription to be notified when a new Tone is received.
  onTone() {
    return this.toneObserver;
  }

  // Returns the Subject to be notified when the chat slideout state changes.
  onChatStateChange():BehaviorSubject<string> {
    return this.chatStateObserver;
  }

  // Toggles the chat slideout.
  toggleChatState() {
    this.chatState = this.chatState === 'hide' ? 'show' : 'hide';
    this.chatStateObserver.next(this.chatState)
    if (this.chatState === 'show' && !this.initialized) {
      this.callConversation('').subscribe(conversationResp => {
        this.addWatsonUtterance(conversationResp.output.text);
      })
    }
  }

  // Hide the chat slideout
  setStateHide() {
    this.chatState = 'hide'
    this.chatStateObserver.next('hide')
  }

  // Show the chat slideout
  setStateShow() {
    this.chatState = 'show'
    this.chatStateObserver.next('show')
    if (!this.initialized) {
      this.callConversation('').subscribe(conversationResp => {
        this.addWatsonUtterance(conversationResp.output.text);
      })
    }
  }

  // Merge the conversation array and the tone analysis respose.
  mergeConversationAndToneAnalysis(toneAnalysis) {
    let idx = 0
    for (let utteranceTone of toneAnalysis.utterances_tone) {
      let highestTone = this.toneSvc.getHighestTone(utteranceTone.tones);
      this.conversation[idx].tone = highestTone.tone_id;
      this.conversation[idx].tone_score = highestTone.score;
      idx++;
    }
    // Emit the last human tone
    this.toneObserver.next(this.conversation[this.conversation.length - 2].tone)
  }
}
