import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-master',
  templateUrl: './menu-master.component.html',
  styleUrls: ['./menu-master.component.scss'],
})
export class MenuMasterComponent  implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}


  @Input() icon_1 :string;
  @Input() icon_2 :string
  @Input() icon_3 :string
  @Input() icon_4 :string

  @Input() txt_icon_1 :string
  @Input() txt_icon_2 :string
  @Input() txt_icon_3 :string
  @Input() txt_icon_4 :string

  @Input() url_icon_1 :string
  @Input() url_icon_2 :string
  @Input() url_icon_3 :string
  @Input() url_icon_4 :string

  navegar(url:string) {
    const id = 42;
    this.router.navigate([`/${url}`]); // Navegar a /detalle/42
  }

}
