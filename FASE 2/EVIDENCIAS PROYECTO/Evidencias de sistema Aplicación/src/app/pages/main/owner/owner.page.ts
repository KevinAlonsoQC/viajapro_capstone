import { Component, OnInit, inject } from '@angular/core';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Chart, registerables } from 'chart.js';  // Para versiones 3.x y superiores
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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

  meta_anual = 50000000;

  ventas_hoy: number = 0;
  ventas_semanal: number = 0;
  ventas_mes: number = 0;
  ventas_totales: number = 0;
  porcentaje_meta: number = 0;

  rankingCentrales: { central: CentralColectivo; empleados: any; ventas: number, lugar: any }[] = [];
  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    this.isMobile = this.detectMobile();
    console.log(this.isMobile ? 'Dispositivo móvil' : 'Web');
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  detectMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || window['opera'];
    return /android|iPad|iPhone|iPod/i.test(userAgent);
  }

  async ionViewWillEnter() {
    Chart.register(...registerables);
    await this.getInfoAndTipoCuenta();
    await this.getData();
  }

  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'central_colectivo';
    const urlPath2 = 'usuario';
    const urlPath3 = 'historial_pago';

    try {
      const [central, users, finanzas] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<CentralColectivo[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any>,
        this.firebaseSvc.getCollectionDocuments(urlPath3) as Promise<any>,
      ]);

      this.centrales = central;
      this.empleados = users.filter(usuario => usuario.tipo_usuario == '1' || usuario.tipo_usuario == '2');
      this.finanzas = finanzas;

      this.generarRankingCentrales();

      const hoy = new Date();
      const inicioSemana = new Date();
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      this.ventas_hoy = 0;
      this.ventas_semanal = 0;
      this.ventas_mes = 0;
      this.ventas_totales = 0;

      this.finanzas.forEach(venta => {
        const fechaPago = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        const monto = parseFloat(venta.amount);

        if (!isNaN(monto)) {
          this.ventas_totales += monto;

          if (fechaPago.toDateString() === hoy.toDateString()) {
            this.ventas_hoy += monto;
          }

          if (fechaPago >= inicioSemana && fechaPago <= hoy) {
            this.ventas_semanal += monto;
          }

          if (fechaPago >= inicioMes && fechaPago <= hoy) {
            this.ventas_mes += monto;
          }
        }
      });

      if (this.meta_anual > 0) {
        this.porcentaje_meta = parseFloat(((this.ventas_totales / this.meta_anual) * 100).toFixed(3));
      }

      this.createSalesCharts();
      this.createAnnualSalesChart();

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

  createAnnualSalesChart() {
    const hoy = new Date();
    const ventasAnuales = [];
    const anos = [];
    for (let i = 0; i < 6; i++) {
      const anio = hoy.getFullYear() - i;
      anos.push(anio.toString());

      const ventarxAnio = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha.getFullYear() === anio;
      });

      const totalVentasAnuales = ventarxAnio.reduce((acc, venta) => acc + parseFloat(venta.amount), 0);
      ventasAnuales.push(totalVentasAnuales);
    }

    new Chart('sales-annual-chart', {
      type: 'bar',
      data: {
        labels: anos,
        datasets: [{
          label: 'Ventas Anuales',
          data: ventasAnuales,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  createSalesCharts() {
    const hoy = new Date();
    const ventasDiarias = [];
    for (let i = 1; i <= 31; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), i);
      const ventasDelDia = this.finanzas.filter(venta => new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).toDateString() === fecha.toDateString());
      ventasDiarias.push(ventasDelDia.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-daily-chart', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}/${hoy.getMonth() + 1}`),
        datasets: [{
          label: 'Ventas Diarias',
          data: ventasDiarias,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const ventasSemanales = [];
    const semanas = [];
    for (let i = 0; i < 4; i++) {
      const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), i * 7);
      const finSemana = new Date(hoy.getFullYear(), hoy.getMonth(), (i + 1) * 7);
      semanas.push(`${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1} - ${finSemana.getDate()}/${finSemana.getMonth() + 1}`);
      const ventasSemana = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha >= inicioSemana && fecha <= finSemana;
      });
      ventasSemanales.push(ventasSemana.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-weekly-chart', {
      type: 'bar',
      data: {
        labels: semanas,
        datasets: [{
          label: 'Ventas Semanales',
          data: ventasSemanales,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const ventasMensuales = [];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    for (let i = 0; i < 12; i++) {
      const ventasMes = this.finanzas.filter(venta => new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).getMonth() === i);
      ventasMensuales.push(ventasMes.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-monthly-chart', {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas Mensuales',
          data: ventasMensuales,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  generarRankingCentrales() {
    const ventasPorCentral = this.centrales.map(central => {
      const ventas = this.finanzas.filter(finanza => finanza.central === central.id).length;
      const empleados = this.empleados.filter(empleado => empleado.central === central.id).slice(0, 4);
      ;
      return { central, ventas, empleados };
    });

    // Ordenar de mayor a menor cantidad de ventas y tomar el top 4
    // Ordenar de mayor a menor cantidad de ventas y tomar el top 4
    this.rankingCentrales = ventasPorCentral
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 4)
      .map((item, index) => ({
        ...item,
        lugar: `${index + 1}`, // Asigna la numeración como 1er, 2do, 3er, etc.
      }));


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
                this.utilsSvc.routerLink('/main/administrador');
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

  async verCentral(central: any){
    console.log(central)
    const alert = await this.alertController.create({
      header: `¿Qué deseas ver de la Central ${central.central.nombre_cental}?`,
      buttons: [
        {
          text: 'Ver Central',
          role: 'confirm',
          handler: async () => {
            this.router.navigate(['/main/owner/central/centrales/detalle-central', central.central.id]);
          }
        },
        {
          text: 'Ver Presidente',
          role: 'confirm',
          handler: async () => {
            this.router.navigate(['/main/owner/central/pasajeros/presidentes/modificar-presidente', central.central.presidente]);
          }
        },
        {
          text: 'Ver Choferes',
          role: 'confirm',
          handler: async () => {
            this.router.navigate(['/main/owner/central/pasajeros/choferes/ver-choferes', central.central.id]);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

}
