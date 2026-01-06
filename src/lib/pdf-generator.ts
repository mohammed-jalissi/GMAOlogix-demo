import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DemandeIntervention } from './supabase';

export const generateDemandePDF = (demande: DemandeIntervention) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = [26, 138, 158]; // #1a8a9e (Teal)

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("GMAOlogix", 20, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("Gestion de Maintenance Assistée par Ordinateur", 20, 32);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`DEMANDE D'INTERVENTION`, 105, 55, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`N° ${demande.numero}`, 105, 62, { align: 'center' });

    // Status Badge
    const statusMap: Record<string, string> = {
        'nouvelle': 'NOUVELLE',
        'en_evaluation': 'EN ÉVALUATION',
        'approuvee': 'APPROUVÉE',
        'rejetee': 'REJETÉE',
        'convertie_ot': 'CONVERTIE EN OT',
        'annulee': 'ANNULÉE'
    };
    const statusText = statusMap[demande.statut] || demande.statut.toUpperCase();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Statut: ${statusText}`, 105, 70, { align: 'center' });


    // Info Sections
    let yPos = 85;

    // Equipement Info
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text("ÉQUIPEMENT", 14, yPos);

    doc.setDrawColor(200);
    doc.line(14, yPos + 2, 196, yPos + 2);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    yPos += 10;

    const equipData = [
        ['Nom', demande.equipement?.nom || 'N/A', 'Code', demande.equipement?.code || 'N/A'],
        ['Localisation', demande.localisation || 'N/A', 'Priorité', demande.priorite.toUpperCase()]
    ];

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: equipData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            2: { fontStyle: 'bold', cellWidth: 40 }
        }
    });

    // Demandeur Info
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text("DÉTAILS DE LA DEMANDE", 14, finalY);
    doc.line(14, finalY + 2, 196, finalY + 2);

    const detailsData = [
        ['Date de création', new Date(demande.created_at).toLocaleString('fr-FR')],
        ['Date souhaitée', new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')],
        ['Type', demande.type_demande.toUpperCase()],
        ['Demandeur', demande.demandeur ? `${demande.demandeur.prenom} ${demande.demandeur.nom}` : 'N/A'],
        ['Titre', demande.titre]
    ];

    autoTable(doc, {
        startY: finalY + 8,
        body: detailsData,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // Description
    const descY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text("Description :", 14, descY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(demande.description, 180);
    doc.text(splitDesc, 14, descY + 6);

    // Footer
    // Fix: Access getNumberOfPages safely
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} / ${pageCount}`, 196, 285, { align: 'right' });
        doc.text(`Généré le ${new Date().toLocaleString('fr-FR')} par GMAOlogix`, 14, 285);
    }

    // Save
    doc.save(`Demande_${demande.numero}.pdf`);
};
