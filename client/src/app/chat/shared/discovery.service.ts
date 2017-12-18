import { Injectable } from '@angular/core';
import { LoopbackLoginService } from '../../auth/loopback/lb-login.service';
import { DiscoveryQuery } from './discovery-query.class';

@Injectable()
export class DiscoveryService {

  constructor(private authService: LoopbackLoginService) { }

  query(query:DiscoveryQuery) {
    return this.authService.makeAuthenticatedHttpJsonPost('api/Discovery/query', query)
  }
}
