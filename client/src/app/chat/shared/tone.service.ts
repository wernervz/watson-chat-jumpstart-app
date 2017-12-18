import { Injectable } from '@angular/core';
import { LoopbackLoginService } from '../../auth/loopback/lb-login.service';
import { Utterance } from './utterance.class';

const TONE_THRESHOLD = 0.68;

@Injectable()
export class ToneService {

  constructor(private authService: LoopbackLoginService) { }

  chatAnalysis(conversation) {
    let req = []
    for (let utterance of conversation) {
      let text = utterance.message;
      if (Array.isArray(utterance.message)) {
        text = utterance.message.join(', ')
      }
      req.push({ text: text, user: utterance.who })
    }
    return this.authService.makeAuthenticatedHttpJsonPost('api/Tone/chatAnalysis', { utterances: req }).map((resp) => {
      return resp;
    })
  }

  getHighestTone(tones) {
    if (!tones || tones.length == 0) {
      return { tone_id: 'none', score: 0 }
    }
    tones.sort((a, b) => {
      if (a.score < b.score) return -1;
      if (a.score > b.score) return 1;
      return 0;
    })
    if (tones[0].score > TONE_THRESHOLD) {
      return tones[0]      
    } else {
      return { tone_id: 'none', score: 0 }
    }
  }
}
