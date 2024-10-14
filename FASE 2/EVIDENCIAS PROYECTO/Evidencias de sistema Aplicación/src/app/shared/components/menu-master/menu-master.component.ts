import { Component, Input, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-menu-master',
  templateUrl: './menu-master.component.html',
  styleUrls: ['./menu-master.component.scss'],
})
export class MenuMasterComponent  implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  constructor() { }
  ngOnInit() {}


  @Input() icon :string;
  @Input() txt_icon :string
  @Input() activo :boolean;
  @Input() url:string
 

  navegar(url:string) {
    const id = 42;
    this.utilsSvc.routerLink(`/${url}`);
  }
}
