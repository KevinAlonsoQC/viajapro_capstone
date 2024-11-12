import { Component, OnInit, inject } from '@angular/core';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";

@Component({
  selector: 'app-owner',
  templateUrl: './owner.page.html',
  styleUrls: ['./owner.page.scss'],
})
export class OwnerPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  isMobile: boolean;

  centrales!: CentralColectivo[];
  empleados: any;
  finanzas: any;

  public barChartLabels:string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;

  rankingCentrales: { central: CentralColectivo; empleados: any; ventas: number }[] = [];
  constructor() { }

  ngOnInit() {
    // Detectar si es móvil o web
    this.isMobile = this.detectMobile();

    // Lógica adicional basada en la detección
    console.log(this.isMobile ? 'Dispositivo móvil' : 'Web');

    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  detectMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || window['opera'];
    return /android|iPad|iPhone|iPod/i.test(userAgent);
  }

  async ionViewWillEnter() {
    await this.getInfoAndTipoCuenta();
    await this.getData();
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'central_colectivo'; // Ruta de la colección de usuarios
    const urlPath2 = 'usuario'; // Ruta de la colección de usuarios
    const urlPath3 = 'historial_pago'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [central, users, finanzas] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<CentralColectivo[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any>,
        this.firebaseSvc.getCollectionDocuments(urlPath3) as Promise<any>,
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.centrales = central;
      this.empleados = users.filter(usuario => {
        return usuario.tipo_usuario == '1' || usuario.tipo_usuario == '2'
      });
      this.finanzas = finanzas;

      this.generarRankingCentrales();

      if (this.centrales.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Centrales Creadas',
          duration: 1500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  generarRankingCentrales() {
    const ventasPorCentral = this.centrales.map(central => {
      const ventas = this.finanzas.filter(finanza => finanza.central === central.id).length;
      const empleados = this.empleados.filter(empleado => empleado.central === central.id).slice(0, 4);
      ;
      return { central, ventas, empleados };
    });

    // Ordenar de mayor a menor cantidad de ventas y tomar el top 4
    this.rankingCentrales = ventasPorCentral
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 4);
      

    console.log('Ranking de Centrales:', this.rankingCentrales);
  }

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const tipo_cuenta = this.usuario.tipo_usuario;

      if (tipo_cuenta == "0") {
        this.utilsSvc.routerLink('/main/owner');
      } else if (tipo_cuenta == "1") {
        this.utilsSvc.routerLink('/main/administrador/admin');
      } else if (tipo_cuenta == "2") {
        this.utilsSvc.routerLink('/main/chofer');
      } else if (tipo_cuenta == "3") {
        this.utilsSvc.routerLink('/main/pasajero');
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo reconocer los datos de tu cuenta. Informa a soporte por favor.',
          duration: 5000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo cargar el tipo de usuario',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  garitas() {
    this.utilsSvc.routerLink('/main/owner/central/centrales');

  }
  config() {
    this.utilsSvc.routerLink('/main/owner/admin');

  }
  pasajeros() {
    this.utilsSvc.routerLink('/main/owner/central/pasajeros');
  }

  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
 
  public barChartData:any[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
  ];
 
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }
}
