import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CheckResult, Recommendation } from '@/services/api/types';
import { EvidenceEvent } from '@/state/EvidenceContext';
import { hashObject } from './hashUtils';

interface ExportInput {
  projectId: string;
  projectName: string;
  timeline: {
    events: EvidenceEvent[];
    metadata: {
      totalEvents: number;
      firstEvent?: string;
      lastEvent?: string;
      integrityVerified: boolean;
      exportedAt: string;
    };
  };
  results: CheckResult[];
  recommendations: Recommendation[];
}

export async function exportToPDF(input: ExportInput): Promise<void> {
  const { projectId, projectName, timeline, results, recommendations } = input;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(0, 115, 230);
  doc.text('Evidence Pack', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(projectName, pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' });
  doc.text(`Project ID: ${projectId}`, pageWidth / 2, 44, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 14, 60);

  const exposedCount = results.filter((r) => r.isExposed).length;
  const criticalCount = results.filter((r) => r.riskLevel === 'critical').length;
  const highCount = results.filter((r) => r.riskLevel === 'high').length;
  const exposedPercent = results.length > 0 ? Math.round((exposedCount / results.length) * 100) : 0;

  const summaryData = [
    ['Total Identities', results.length.toString()],
    ['Exposed Identities', `${exposedCount} (${exposedPercent}%)`],
    ['Critical Risk', criticalCount.toString()],
    ['High Risk', highCount.toString()],
    ['Recommendations', recommendations.length.toString()],
    ['Pending Actions', recommendations.filter((r) => !r.isDone).length.toString()],
  ];

  autoTable(doc, {
    startY: 65,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [0, 115, 230] },
    margin: { left: 14, right: 14 },
  });

  let yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.text('Top 10 High-Risk Identities', 14, yPos);

  const topRisks = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r) => [
      r.identity.email,
      r.identity.role,
      r.score.toString(),
      r.riskLevel.toUpperCase(),
      r.breachCount.toString(),
    ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Email', 'Role', 'Score', 'Risk', 'Breaches']],
    body: topRisks,
    theme: 'striped',
    headStyles: { fillColor: [0, 115, 230] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
  });

  doc.addPage();

  doc.setFontSize(14);
  doc.text('Recommendations', 14, 20);

  const pendingRecs = recommendations
    .filter((r) => !r.isDone)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .map((r) => [
      r.title,
      r.audience.toUpperCase(),
      r.severity.toUpperCase(),
      r.affectedCount.toString(),
    ]);

  autoTable(doc, {
    startY: 25,
    head: [['Recommendation', 'Audience', 'Severity', 'Affected']],
    body: pendingRecs,
    theme: 'striped',
    headStyles: { fillColor: [0, 115, 230] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
    },
  });

  doc.addPage();

  doc.setFontSize(14);
  doc.text('Audit Trail (Evidence Timeline)', 14, 20);

  const timelineData = timeline.events.map((e) => [
    e.type,
    new Date(e.timestamp).toLocaleString(),
    e.hash.substring(0, 16) + '...',
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['Event', 'Timestamp', 'Hash']],
    body: timelineData,
    theme: 'striped',
    headStyles: { fillColor: [0, 115, 230] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.text('Integrity Verification', 14, yPos);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  const integrityStatus = timeline.metadata.integrityVerified ? 'VERIFIED' : 'UNVERIFIED';
  doc.text(`Chain Integrity: ${integrityStatus}`, 14, yPos + 8);
  doc.text(`Total Events: ${timeline.metadata.totalEvents}`, 14, yPos + 14);

  const exportHash = hashObject({
    projectId,
    resultsCount: results.length,
    exportedAt: new Date().toISOString(),
  });
  doc.text(`Export Hash: ${exportHash.substring(0, 32)}...`, 14, yPos + 20);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Evidence Pack | ${projectName}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`evidence-pack-${projectId}-${new Date().toISOString().split('T')[0]}.pdf`);
}
