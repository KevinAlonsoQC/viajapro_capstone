import { Component, Input, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-conductor-item',
  templateUrl: './conductor-item.component.html',
  styleUrls: ['./conductor-item.component.scss'],
})
export class ConductorItemComponent  implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  @Input() nombre:string;
  @Input() rut:string;
  @Input() url:string

  
  constructor() { }

  ngOnInit() {}

  navegar(url:string) {
    const id = 42;
    this.utilsSvc.routerLink(`/${url}`);
  }

}
