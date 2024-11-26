import { Component, OnInit, inject } from '@angular/core';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Chart, registerables } from 'chart.js';  // Para versiones 3.x y superiores
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as Papa from 'papaparse'; // Para CSV
import * as XLSX from 'xlsx'; // Para Excel

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

  selectedYear: number;

  chartDaily: any;
  chartMonthly: any;
  chartAnnual: any;

  currentYear: number = new Date().getFullYear();  // Año actual
  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    this.selectedYear = new Date().getFullYear(); // Año por defecto al actual
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    this.utilsSvc.getFromLocalStorage('usuario');
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

      this.updateCharts(); // Actualizar los gráficos cuando los datos estén listos.


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

  // Filtrar las ventas por el año seleccionado
  getVentasPorAnio() {
    return this.finanzas.filter(venta => {
      const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
      return fecha.getFullYear() === this.selectedYear;
    });
  }

  async updateCharts() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    try {
      this.utilsSvc.presentToast({
        message: 'Gráficos Actualizados',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      this.createSalesCharts(this.selectedYear);
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo actualizar los gráficos',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  createSalesCharts(year: number) {
    const ventasDiarias = [];
    const month = new Date().getMonth();
    const diasDelMes = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= 31; i++) {
      if (i <= diasDelMes) {
        const fecha = new Date(year, month, i);
        const ventasDelDia = this.finanzas.filter(venta =>
          new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).toDateString() === fecha.toDateString()
        );
        ventasDiarias.push(ventasDelDia.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
      } else {
        ventasDiarias.push(0);
      }
    }

    // Destruir el gráfico anterior si existe
    if (this.chartDaily) {
      this.chartDaily.destroy();
    }

    // Crear el gráfico de ventas diarias
    this.chartDaily = new Chart('sales-daily-chart-admin', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}/${month + 1}`),
        datasets: [{
          label: 'Ventas Diarias ' + year,
          data: ventasDiarias,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: { callback: (val, index) => (index + 1 <= diasDelMes ? `${index + 1}/${month + 1}` : '') }
          },
          y: { beginAtZero: true }
        }
      }
    });

    const ventasMensuales = [];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Aquí filtras las ventas del mes específico del año seleccionado
    for (let i = 0; i < 12; i++) {
      const ventasMes = this.finanzas.filter(venta => {
        const fechaVenta = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fechaVenta.getFullYear() === year && fechaVenta.getMonth() === i;
      });
      ventasMensuales.push(ventasMes.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    // Destruir el gráfico anterior si existe
    if (this.chartMonthly) {
      this.chartMonthly.destroy();
    }

    // Crear el gráfico de ventas mensuales
    this.chartMonthly = new Chart('sales-monthly-chart-admin', {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas Mensuales ' + year,
          data: ventasMensuales,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });

    // Destruir el gráfico anterior si existe
    if (this.chartAnnual) {
      this.chartAnnual.destroy();
    }

    const ventasAnuales = [];
    const anos = [];

    // Recorrer los últimos 6 años (por ejemplo, de 2024 a 2019)
    for (let i = 0; i < 6; i++) {
      const anio = year - i;
      anos.push(anio.toString());

      // Filtrar ventas por año
      const ventarxAnio = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha.getFullYear() === anio;
      });

      // Calcular las ventas anuales
      const totalVentasAnuales = ventarxAnio.reduce((acc, venta) => acc + parseFloat(venta.amount), 0);
      ventasAnuales.push(totalVentasAnuales); // Añadir el total de ventas del año (0 si no hay ventas)
    }

    // Destruir el gráfico anterior si existe
    if (this.chartAnnual) {
      this.chartAnnual.destroy();
    }

    // Crear el gráfico de ventas anuales
    this.chartAnnual = new Chart('sales-annual-chart-admin', {
      type: 'bar',
      data: {
        labels: anos, // Etiquetas con los años
        datasets: [{
          label: 'Ventas Anuales',
          data: ventasAnuales, // Datos de las ventas anuales (con 0 si no hay ventas)
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
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


  downloadCSV() {
    const ventasFiltradas = this.getVentasPorAnio();

    if (ventasFiltradas.length === 0) {
      this.utilsSvc.presentToast({
        message: 'No hay ventas para el año seleccionado',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return;
    }

    const data = ventasFiltradas.map(venta => ({
      'ID_Transaccion': venta.payment_id,
      'Fecha': venta.fecha_pago,
      'Monto': Math.trunc(venta.amount),
      'Nombre_Chofer': venta.nombre_chofer,
      'Rut_Chofer': venta.rut_chofer,
      'Nombre_Pasajero': venta.nombre_pasajero,
      'Rut_Pasajero': venta.rut_pasajero,
      'Razon': venta.subject,
      'Modelo_Vehiculo': venta.vehiculo.modelo,
      'Patente_Vehiculo': venta.vehiculo.patente,
      'Banco': venta.bank,
      'Comprobante': venta.receipt_url
    }));

    // Usando PapaParse para convertir los datos a CSV
    const csv = Papa.unparse(data);

    // Crear un blob con el CSV y preparar la descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${this.selectedYear}.csv`; // Nombre del archivo CSV con el año
    link.click(); // Iniciar la descarga
  }

  // Función para descargar los datos en Excel
  downloadExcel() {
    const ventasFiltradas = this.getVentasPorAnio();

    if (ventasFiltradas.length === 0) {
      this.utilsSvc.presentToast({
        message: 'No hay ventas para el año seleccionado',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });      
      return;
    }

    const data = ventasFiltradas.map(venta => ({
      'ID_Transaccion': venta.payment_id,
      'Fecha': venta.fecha_pago,
      'Monto': Math.trunc(venta.amount),
      'Nombre_Chofer': venta.nombre_chofer,
      'Rut_Chofer': venta.rut_chofer,
      'Nombre_Pasajero': venta.nombre_pasajero,
      'Rut_Pasajero': venta.rut_pasajero,
      'Razon': venta.subject,
      'Modelo_Vehiculo': venta.vehiculo.modelo,
      'Patente_Vehiculo': venta.vehiculo.patente,
      'Banco': venta.bank,
      'Comprobante': venta.receipt_url
    }));

    // Convertir el array de objetos a una hoja de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = { Sheets: { 'Ventas': ws }, SheetNames: ['Ventas'] };

    // Exportar la hoja como un archivo Excel
    XLSX.writeFile(wb, `ventas_${this.selectedYear}.xlsx`); // Nombre del archivo Excel con el año
  }

}
