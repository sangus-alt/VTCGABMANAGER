import { formatCurrency, formatLicensePlate } from "./constants";

interface PrintOptions {
  title: string;
  content: string;
  styles?: string;
  orientation?: 'portrait' | 'landscape';
}

// Base print function
export function printDocument({ title, content, styles = '', orientation = 'portrait' }: PrintOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const baseStyles = `
    <style>
      @media print {
        @page {
          size: A4 ${orientation};
          margin: 1cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1976D2;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .document-title {
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .info-section {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .info-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .info-value {
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin: 40px 0 20px 0;
        }
        .signature-box {
          text-align: center;
          border-top: 1px solid #333;
          padding-top: 10px;
          margin-top: 40px;
        }
        .no-print {
          display: none;
        }
        .fcfa {
          font-weight: bold;
          color: #388E3C;
        }
      }
      ${styles}
    </style>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <div class="company-name">VTC GAB</div>
        <div class="company-details">
          Système de Gestion de Taxi - Libreville, Gabon<br>
          Tél: +241 XX XX XX XX | Email: contact@vtcgab.com
        </div>
      </div>
      ${content}
      <div class="footer">
        Document généré le ${new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} | VTC GAB - Système de Gestion
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

// Print invoice/receipt
export function printInvoice(booking: any, payment?: any) {
  const content = `
    <div class="document-title">FACTURE / REÇU</div>
    
    <div class="info-grid">
      <div class="info-section">
        <h3>Informations Client</h3>
        <div class="info-row">
          <span class="info-label">Nom:</span>
          <span class="info-value">${booking.client?.user?.firstName} ${booking.client?.user?.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Téléphone:</span>
          <span class="info-value">${booking.client?.user?.phone || 'Non renseigné'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${booking.client?.user?.email || 'Non renseigné'}</span>
        </div>
      </div>
      
      <div class="info-section">
        <h3>Détails de la Course</h3>
        <div class="info-row">
          <span class="info-label">N° Réservation:</span>
          <span class="info-value">#${booking.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${new Date(booking.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Statut:</span>
          <span class="info-value">${booking.status}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>Itinéraire</h3>
      <div class="info-row">
        <span class="info-label">Départ:</span>
        <span class="info-value">${booking.pickupLocation}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Arrivée:</span>
        <span class="info-value">${booking.dropoffLocation}</span>
      </div>
      ${booking.distance ? `
        <div class="info-row">
          <span class="info-label">Distance:</span>
          <span class="info-value">${booking.distance} km</span>
        </div>
      ` : ''}
      ${booking.duration ? `
        <div class="info-row">
          <span class="info-label">Durée:</span>
          <span class="info-value">${booking.duration} minutes</span>
        </div>
      ` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tarif de base</td>
          <td class="fcfa">${formatCurrency(booking.baseFare || 0)}</td>
        </tr>
        ${booking.distance ? `
          <tr>
            <td>Distance (${booking.distance} km)</td>
            <td class="fcfa">${formatCurrency((booking.totalFare - booking.baseFare) || 0)}</td>
          </tr>
        ` : ''}
        <tr class="total-row">
          <td><strong>TOTAL</strong></td>
          <td class="fcfa"><strong>${formatCurrency(booking.totalFare || 0)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="info-section">
      <h3>Paiement</h3>
      <div class="info-row">
        <span class="info-label">Méthode:</span>
        <span class="info-value">${booking.paymentMethod || 'Non défini'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Statut:</span>
        <span class="info-value">${booking.paymentStatus || 'En attente'}</span>
      </div>
      ${payment?.transactionId ? `
        <div class="info-row">
          <span class="info-label">Transaction:</span>
          <span class="info-value">${payment.transactionId}</span>
        </div>
      ` : ''}
    </div>

    <div class="signature-section">
      <div class="signature-box">Signature Client</div>
      <div class="signature-box">Signature Chauffeur</div>
    </div>
  `;

  printDocument({
    title: `Facture_${booking.id}`,
    content,
  });
}

// Print fuel log
export function printFuelLog(fuelRecords: any[], vehicle?: any, period?: string) {
  const totalCost = fuelRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0);
  const totalLiters = fuelRecords.reduce((sum, record) => sum + (record.liters || 0), 0);

  const content = `
    <div class="document-title">CARNET DE CARBURANT</div>
    
    ${vehicle ? `
      <div class="info-section">
        <h3>Véhicule</h3>
        <div class="info-row">
          <span class="info-label">Plaque:</span>
          <span class="info-value">${formatLicensePlate(vehicle.licensePlate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Véhicule:</span>
          <span class="info-value">${vehicle.make} ${vehicle.model} (${vehicle.year})</span>
        </div>
      </div>
    ` : ''}

    ${period ? `
      <div class="info-section">
        <h3>Période</h3>
        <div class="info-row">
          <span class="info-label">Période:</span>
          <span class="info-value">${period}</span>
        </div>
      </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Station</th>
          <th>Chauffeur</th>
          <th>Litres</th>
          <th>Prix/L</th>
          <th>Total</th>
          <th>Kilométrage</th>
        </tr>
      </thead>
      <tbody>
        ${fuelRecords.map(record => `
          <tr>
            <td>${new Date(record.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>${record.stationName}</td>
            <td>${record.driver?.user?.firstName} ${record.driver?.user?.lastName}</td>
            <td>${record.liters?.toFixed(1)} L</td>
            <td>${formatCurrency(record.pricePerLiter || 0)}</td>
            <td class="fcfa">${formatCurrency(record.totalCost || 0)}</td>
            <td>${record.mileageAtFuel?.toLocaleString() || '-'} km</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3"><strong>TOTAL</strong></td>
          <td><strong>${totalLiters.toFixed(1)} L</strong></td>
          <td></td>
          <td class="fcfa"><strong>${formatCurrency(totalCost)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="info-section">
      <h3>Statistiques</h3>
      <div class="info-row">
        <span class="info-label">Nombre de pleins:</span>
        <span class="info-value">${fuelRecords.length}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Consommation totale:</span>
        <span class="info-value">${totalLiters.toFixed(1)} litres</span>
      </div>
      <div class="info-row">
        <span class="info-label">Coût total:</span>
        <span class="info-value fcfa">${formatCurrency(totalCost)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Prix moyen par litre:</span>
        <span class="info-value fcfa">${formatCurrency(totalLiters > 0 ? totalCost / totalLiters : 0)}</span>
      </div>
    </div>
  `;

  printDocument({
    title: `Carnet_Carburant_${vehicle?.licensePlate || 'Global'}_${new Date().toISOString().split('T')[0]}`,
    content,
    orientation: 'landscape',
  });
}

// Print maintenance report
export function printMaintenanceReport(maintenanceRecords: any[], vehicle?: any, period?: string) {
  const totalCost = maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

  const content = `
    <div class="document-title">RAPPORT DE MAINTENANCE</div>
    
    ${vehicle ? `
      <div class="info-section">
        <h3>Véhicule</h3>
        <div class="info-row">
          <span class="info-label">Plaque:</span>
          <span class="info-value">${formatLicensePlate(vehicle.licensePlate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Véhicule:</span>
          <span class="info-value">${vehicle.make} ${vehicle.model} (${vehicle.year})</span>
        </div>
        <div class="info-row">
          <span class="info-label">Kilométrage actuel:</span>
          <span class="info-value">${vehicle.mileage?.toLocaleString() || 0} km</span>
        </div>
      </div>
    ` : ''}

    ${period ? `
      <div class="info-section">
        <h3>Période</h3>
        <div class="info-row">
          <span class="info-label">Période:</span>
          <span class="info-value">${period}</span>
        </div>
      </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Description</th>
          <th>Prestataire</th>
          <th>Coût</th>
          <th>Kilométrage</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        ${maintenanceRecords.map(record => `
          <tr>
            <td>${new Date(record.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>${record.type}</td>
            <td>${record.description}</td>
            <td>${record.serviceProvider || '-'}</td>
            <td class="fcfa">${record.cost ? formatCurrency(record.cost) : '-'}</td>
            <td>${record.mileageAtService?.toLocaleString() || '-'} km</td>
            <td>${record.status}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL</strong></td>
          <td class="fcfa"><strong>${formatCurrency(totalCost)}</strong></td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>

    <div class="info-section">
      <h3>Statistiques</h3>
      <div class="info-row">
        <span class="info-label">Nombre d'interventions:</span>
        <span class="info-value">${maintenanceRecords.length}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Coût total:</span>
        <span class="info-value fcfa">${formatCurrency(totalCost)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Coût moyen par intervention:</span>
        <span class="info-value fcfa">${formatCurrency(maintenanceRecords.length > 0 ? totalCost / maintenanceRecords.length : 0)}</span>
      </div>
    </div>

    ${maintenanceRecords.some(r => r.nextServiceDate) ? `
      <div class="info-section">
        <h3>Prochaines Maintenances Programmées</h3>
        ${maintenanceRecords
          .filter(r => r.nextServiceDate && new Date(r.nextServiceDate) > new Date())
          .map(record => `
            <div class="info-row">
              <span class="info-label">${record.type}:</span>
              <span class="info-value">${new Date(record.nextServiceDate).toLocaleDateString('fr-FR')}</span>
            </div>
          `).join('')}
      </div>
    ` : ''}
  `;

  printDocument({
    title: `Maintenance_${vehicle?.licensePlate || 'Global'}_${new Date().toISOString().split('T')[0]}`,
    content,
    orientation: 'landscape',
  });
}

// Print driver report
export function printDriverReport(driver: any, bookings: any[], period?: string) {
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.totalFare || 0), 0);

  const content = `
    <div class="document-title">RAPPORT CHAUFFEUR</div>
    
    <div class="info-grid">
      <div class="info-section">
        <h3>Informations Chauffeur</h3>
        <div class="info-row">
          <span class="info-label">Nom:</span>
          <span class="info-value">${driver.user?.firstName} ${driver.user?.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Permis:</span>
          <span class="info-value">${driver.licenseNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Téléphone:</span>
          <span class="info-value">${driver.user?.phone || 'Non renseigné'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Note:</span>
          <span class="info-value">${driver.rating || 'Aucune'}/5</span>
        </div>
      </div>
      
      ${period ? `
        <div class="info-section">
          <h3>Période</h3>
          <div class="info-row">
            <span class="info-label">Période:</span>
            <span class="info-value">${period}</span>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="info-section">
      <h3>Statistiques</h3>
      <div class="info-row">
        <span class="info-label">Total courses:</span>
        <span class="info-value">${bookings.length}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Courses terminées:</span>
        <span class="info-value">${completedBookings.length}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Taux de réussite:</span>
        <span class="info-value">${bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 0}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">Chiffre d'affaires:</span>
        <span class="info-value fcfa">${formatCurrency(totalRevenue)}</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Départ</th>
          <th>Arrivée</th>
          <th>Statut</th>
          <th>Montant</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map(booking => `
          <tr>
            <td>${new Date(booking.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>${booking.pickupLocation}</td>
            <td>${booking.dropoffLocation}</td>
            <td>${booking.status}</td>
            <td class="fcfa">${formatCurrency(booking.totalFare || 0)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL</strong></td>
          <td class="fcfa"><strong>${formatCurrency(totalRevenue)}</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  printDocument({
    title: `Rapport_Chauffeur_${driver.user?.firstName}_${driver.user?.lastName}_${new Date().toISOString().split('T')[0]}`,
    content,
  });
}
