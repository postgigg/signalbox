import { jsPDF } from 'jspdf';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditScores {
  qualification: number;
  speed: number;
  routing: number;
  overall: number;
}

interface AuditDetails {
  formCount: number;
  inputCount: number;
  hasSelect: boolean;
  hasRadio: boolean;
  hasPhoneLink: boolean;
  hasMailtoAction: boolean;
  hasFormHandler: boolean;
  hasHawkLeads: boolean;
  qualificationKeywordsFound: string[];
  pagesChecked: string[];
  findings: string[];
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

function scoreRgb(s: number): [number, number, number] {
  if (s >= 70) return [22, 163, 74];
  if (s >= 40) return [202, 138, 4];
  return [220, 38, 38];
}

function tier(s: number): string {
  if (s >= 70) return 'Good';
  if (s >= 40) return 'Needs Work';
  return 'Critical';
}

const INK: [number, number, number] = [15, 23, 42];
const STONE: [number, number, number] = [100, 116, 139];
const STONE_LT: [number, number, number] = [148, 163, 184];
const BORDER: [number, number, number] = [226, 232, 240];
const SURFACE: [number, number, number] = [248, 250, 252];
const WHITE: [number, number, number] = [255, 255, 255];
const SIGNAL: [number, number, number] = [37, 99, 235];
const DANGER: [number, number, number] = [220, 38, 38];
const SUCCESS: [number, number, number] = [22, 163, 74];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function drawLogo(doc: jsPDF, cx: number, cy: number): void {
  // Three-stroke mark centered at (cx, cy), ~6mm tall
  const s = 0.22;
  const ox = cx - 13 * s; // offset so mark is left of center
  const oy = cy - 24 * s;

  doc.setFillColor(50, 65, 90);
  doc.triangle(ox + 6 * s, oy + 24 * s, ox + 16 * s, oy + 6 * s, ox + 16 * s, oy + 42 * s, 'F');
  doc.setFillColor(80, 100, 130);
  doc.triangle(ox + 12 * s, oy + 24 * s, ox + 20 * s, oy + 10 * s, ox + 20 * s, oy + 38 * s, 'F');
  doc.setFillColor(...WHITE);
  doc.triangle(ox + 18 * s, oy + 24 * s, ox + 26 * s, oy + 12 * s, ox + 26 * s, oy + 36 * s, 'F');
  doc.circle(ox + 10 * s, oy + 24 * s, 1.2 * s, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('HawkLeads', ox + 28 * s + 1, oy + 25 * s);
}

function dot(doc: jsPDF, x: number, y: number, color: [number, number, number]): void {
  doc.setFillColor(...color);
  doc.circle(x, y, 1, 'F');
}

function divider(doc: jsPDF, x: number, y: number, w: number): void {
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.line(x, y, x + w, y);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateAuditPdf(
  _domain: string,
  scores: AuditScores,
  details: AuditDetails,
  auditId: string
): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 24; // margin
  const C = W - M * 2; // content width
  let y = 0;

  // =========================================================================
  // HEADER — compact dark strip: logo left, score right
  // =========================================================================
  const headerH = 36;
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, headerH, 'F');

  drawLogo(doc, M + 12, headerH / 2);

  // Score on the right
  const [oR, oG, oB] = scoreRgb(scores.overall);
  const scoreX = W - M - 10;
  doc.setTextColor(oR, oG, oB);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(scores.overall), scoreX, headerH / 2 + 1, { align: 'center' });
  doc.setTextColor(...STONE_LT);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('/100', scoreX, headerH / 2 + 5, { align: 'center' });
  doc.setFontSize(6);
  doc.text(tier(scores.overall), scoreX, headerH / 2 + 9, { align: 'center' });

  y = headerH + 16;

  // =========================================================================
  // CATEGORY SCORES — 3 even columns
  // =========================================================================
  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Scores', M, y);
  y += 4;
  divider(doc, M, y, C);
  y += 10;

  const colW = C / 3;
  const cats = [
    { label: 'Qualification', score: scores.qualification },
    { label: 'Speed', score: scores.speed },
    { label: 'Routing', score: scores.routing },
  ] as const;

  for (let i = 0; i < 3; i++) {
    const cat = cats[i];
    if (!cat) continue;
    const cx = M + i * colW + colW / 2;
    const [cr, cg, cb] = scoreRgb(cat.score);

    // Big number
    doc.setTextColor(cr, cg, cb);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(String(cat.score), cx, y, { align: 'center' });

    // Label
    doc.setTextColor(...INK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(cat.label, cx, y + 6, { align: 'center' });

    // Tier
    doc.setTextColor(cr, cg, cb);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(tier(cat.score), cx, y + 10, { align: 'center' });

    // Bar
    const bx = M + i * colW + 8;
    const bw = colW - 16;
    const by = y + 13;
    doc.setFillColor(...SURFACE);
    doc.roundedRect(bx, by, bw, 2, 1, 1, 'F');
    doc.setFillColor(cr, cg, cb);
    doc.roundedRect(bx, by, Math.max((cat.score / 100) * bw, 1.5), 2, 1, 1, 'F');
  }

  y += 26;

  // =========================================================================
  // DETAILED BREAKDOWN — two-column layout
  // =========================================================================
  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Breakdown', M, y);
  y += 4;
  divider(doc, M, y, C);
  y += 8;

  const groups: Array<{ title: string; items: Array<{ pass: boolean; text: string }> }> = [
    {
      title: 'Qualification',
      items: [
        { pass: details.formCount > 0, text: details.formCount > 0 ? `${String(details.formCount)} form(s) found` : 'No forms found' },
        { pass: details.inputCount >= 4, text: `${String(details.inputCount)} input fields` },
        { pass: details.hasSelect, text: details.hasSelect ? 'Dropdowns present' : 'No dropdowns' },
        { pass: details.hasRadio, text: details.hasRadio ? 'Radio buttons present' : 'No radio buttons' },
        { pass: details.qualificationKeywordsFound.length >= 3, text: `${String(details.qualificationKeywordsFound.length)} qualification keyword(s)` },
      ],
    },
    {
      title: 'Speed',
      items: [
        { pass: details.hasFormHandler, text: details.hasFormHandler ? 'Server form handler' : details.hasMailtoAction ? 'Mailto action' : 'No handler' },
        { pass: details.formCount > 0, text: details.formCount > 0 ? 'Electronic capture' : 'No capture' },
        { pass: !(details.hasPhoneLink && details.formCount === 0), text: details.hasPhoneLink && details.formCount === 0 ? 'Phone only' : 'Not phone-only' },
        { pass: details.inputCount >= 3, text: `${String(details.inputCount)} data fields` },
      ],
    },
    {
      title: 'Routing',
      items: [
        { pass: details.hasSelect, text: details.hasSelect ? 'Segmentation inputs' : 'No segmentation' },
        { pass: details.hasRadio, text: details.hasRadio ? 'Categorization inputs' : 'No categorization' },
        { pass: details.formCount >= 2, text: details.formCount >= 2 ? 'Multi-form capture' : 'Single form' },
      ],
    },
  ];

  // Render in two columns: Qualification on left, Speed+Routing on right
  const halfW = C / 2 - 4;
  const leftX = M;
  const rightX = M + C / 2 + 4;
  const startY = y;

  // Left column: Qualification
  let ly = startY;
  const q = groups[0];
  if (q) {
    doc.setTextColor(...INK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(q.title, leftX, ly);
    ly += 5;
    for (const item of q.items) {
      dot(doc, leftX + 1.5, ly - 0.7, item.pass ? SUCCESS : BORDER);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(item.pass ? INK[0] : STONE[0], item.pass ? INK[1] : STONE[1], item.pass ? INK[2] : STONE[2]);
      doc.text(item.text, leftX + 5, ly);
      ly += 5;
    }
  }

  // Right column: Speed + Routing
  let ry = startY;
  for (let g = 1; g < groups.length; g++) {
    const grp = groups[g];
    if (!grp) continue;
    doc.setTextColor(...INK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(grp.title, rightX, ry);
    ry += 5;
    for (const item of grp.items) {
      dot(doc, rightX + 1.5, ry - 0.7, item.pass ? SUCCESS : BORDER);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(item.pass ? INK[0] : STONE[0], item.pass ? INK[1] : STONE[1], item.pass ? INK[2] : STONE[2]);
      doc.text(item.text, rightX + 5, ry);
      ry += 5;
    }
    ry += 4;
  }

  y = Math.max(ly, ry) + 8;

  // =========================================================================
  // ISSUES FOUND
  // =========================================================================
  if (details.findings.length > 0 && !details.hasHawkLeads) {
    doc.setTextColor(...INK);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Issues Found', M, y);
    y += 4;
    divider(doc, M, y, C);
    y += 7;

    for (const finding of details.findings) {
      dot(doc, M + 1.5, y - 0.7, DANGER);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...STONE);
      const lines = doc.splitTextToSize(finding, C - 8) as string[];
      doc.text(lines, M + 5, y);
      y += lines.length * 4 + 3;
    }
    y += 4;
  }

  // =========================================================================
  // STATS — 4-column row in a light background band
  // =========================================================================
  const statsH = 20;
  doc.setFillColor(...SURFACE);
  doc.rect(0, y, W, statsH, 'F');
  divider(doc, M, y, C);
  divider(doc, M, y + statsH, C);

  const stats = [
    { label: 'Forms', value: details.formCount },
    { label: 'Fields', value: details.inputCount },
    { label: 'Signals', value: details.qualificationKeywordsFound.length },
    { label: 'Pages', value: details.pagesChecked.length },
  ] as const;

  const sw = C / 4;
  for (let i = 0; i < 4; i++) {
    const stat = stats[i];
    if (!stat) continue;
    const sx = M + i * sw + sw / 2;
    doc.setTextColor(...INK);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(String(stat.value), sx, y + 9, { align: 'center' });
    doc.setTextColor(...STONE);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, sx, y + 14, { align: 'center' });
  }

  // =========================================================================
  // FOOTER — pinned to bottom
  // =========================================================================
  const fH = 20;
  const fY = H - fH;
  doc.setFillColor(...INK);
  doc.rect(0, fY, W, fH, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    details.hasHawkLeads ? 'You nailed it.' : 'Fix this in 2 minutes.',
    W / 2, fY + 6, { align: 'center' }
  );
  doc.setTextColor(...STONE_LT);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    details.hasHawkLeads ? 'This site uses HawkLeads. Nothing to fix.' : 'hawkleads.io/signup',
    W / 2, fY + 10.5, { align: 'center' }
  );
  doc.setTextColor(...SIGNAL);
  doc.setFontSize(5.5);
  doc.text(`hawkleads.io/audit/${auditId}`, W / 2, fY + 14.5, { align: 'center' });
  doc.setTextColor(70, 80, 100);
  doc.setFontSize(5);
  doc.text('HawkLeads (Workbird LLC)', W / 2, fY + 18, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
