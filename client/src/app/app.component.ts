import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { APP_CONFIG, AppConfig } from './config/app-config.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public constructor(private titleService: Title, @Inject(APP_CONFIG) private appConfig: AppConfig) {
    this.titleService.setTitle( this.appConfig.app_title );
  }

}
