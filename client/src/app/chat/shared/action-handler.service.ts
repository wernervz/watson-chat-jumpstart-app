import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DiscoveryService } from './discovery.service';
import { DiscoveryQuery } from './discovery-query.class';
import { Utterance } from './utterance.class';

@Injectable()
export class ActionHandlerService {

  discoveryResults:any;
  currentIdx:number = 0;

  constructor(private discoverySvc:DiscoveryService) { }

  // Called from the ChatControlService to handle all actions returned by the conversation.
  executeAction(conversationResp, conversation) {
    let action = conversationResp.output.action;
    switch (action) {
      case 'discovery_nlq': {
        let nlq = conversation[conversation.length - 4].message        
        let dq = new DiscoveryQuery()
        dq.natural_language_query = nlq
        return this.discoverySvc.query(dq).map(discoveryResp => {
          this.discoveryResults = discoveryResp;
          let utterance = new Utterance(discoveryResp.results[0].text, 'watson');
          utterance.more = true
          utterance.result_score = discoveryResp.results[0].result_metadata.score * 10;
          return utterance
        })
      }
      case 'choice': {
        return Observable.create(observer => {
          let message = conversation[conversation.length - 1].message 
          let utterance = new Utterance(message, 'watson', 'choice')
          utterance.choices = conversationResp.output.choices
          observer.next(utterance)
          observer.complete()
        })
      }
      default: {
        return null
      }
    }
  }

  // Called to return an utterance with the next item in the list.  Used for Discovery results.
  nextItem() {
    return Observable.create(observer => {
      this.currentIdx++
      let utterance = new Utterance(this.discoveryResults.results[this.currentIdx].text, 'watson');
      utterance.result_score = this.discoveryResults.results[this.currentIdx].result_metadata.score * 10;
      if (this.discoveryResults.results.length > (this.currentIdx + 1)) {
        utterance.more = true        
      }
      observer.next(utterance)
      observer.complete()      
    })
  }
}
