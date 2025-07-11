import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MedicalService } from '../../services/medical.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ServiceDetail } from '../../models/service.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  templateUrl: './service-detail-page.component.html',
  styleUrl: './service-detail-page.component.css',
  imports: [
    FooterComponent,
    HeaderComponent,
    BreadcrumbsComponent,
    TranslateModule,
  ],
})
export class ServiceDetailComponent implements OnInit {
  private medicalService = inject(MedicalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private breadcrumbService = inject(BreadcrumbService);
  private translate = inject(TranslateService);

  // Signals for state
  service = signal<ServiceDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private serviceId: string | null = null;

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (!this.serviceId) {
      this.error.set('Service not found!');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.medicalService.getServiceById(this.serviceId).subscribe({
      next: (data: any) => {
        if (!data || typeof data !== 'object' || !data.service_name) {
          this.error.set('Invalid service data!');
          this.isLoading.set(false);
          return;
        }
        this.service.set(data);
        this.isLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const breadcrumbPath = `/service/${this.serviceId}`;
        const label = data.service_name || 'Service Detail';
        this.breadcrumbService.setLabel(breadcrumbPath, label);
      },
      error: () => {
        this.error.set('Could not load this service.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy() {
    // Clear breadcrumb label when leaving page
    if (this.serviceId) {
      const breadcrumbPath = `/service/${this.serviceId}`;
      this.breadcrumbService.clearLabel(breadcrumbPath);
    }
  }

  backToList() {
    this.router.navigate(['/service']);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 10);
  }
}
