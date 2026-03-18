'use client';

import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type LeadTier = 'hot' | 'warm' | 'cold';
export type LeadStatus =
  | 'new'
  | 'viewed'
  | 'contacted'
  | 'qualified'
  | 'disqualified'
  | 'converted'
  | 'archived';

export interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
  tier: LeadTier;
  status: LeadStatus;
  createdAt: string; // ISO date string
}

export type SortField = 'name' | 'email' | 'score' | 'tier' | 'status' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface LeadTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function tierLabel(tier: LeadTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function statusLabel(status: LeadStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadTable({
  leads,
  onLeadClick,
  sortField,
  sortOrder,
  onSort,
}: LeadTableProps) {
  const sortedFor = (field: SortField): 'asc' | 'desc' | false =>
    sortField === field ? sortOrder : false;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell sortable sorted={sortedFor('name')} onClick={() => onSort('name')}>
            Name
          </TableHeaderCell>
          <TableHeaderCell sortable sorted={sortedFor('email')} onClick={() => onSort('email')}>
            Email
          </TableHeaderCell>
          <TableHeaderCell sortable sorted={sortedFor('score')} onClick={() => onSort('score')} align="right">
            Score
          </TableHeaderCell>
          <TableHeaderCell sortable sorted={sortedFor('tier')} onClick={() => onSort('tier')}>
            Tier
          </TableHeaderCell>
          <TableHeaderCell sortable sorted={sortedFor('status')} onClick={() => onSort('status')}>
            Status
          </TableHeaderCell>
          <TableHeaderCell sortable sorted={sortedFor('createdAt')} onClick={() => onSort('createdAt')} align="right">
            When
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id} onClick={() => onLeadClick(lead)}>
            <TableCell>
              <span className="font-medium">{lead.name}</span>
            </TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell align="right" mono>
              {lead.score}
            </TableCell>
            <TableCell>
              <Badge variant={lead.tier as BadgeVariant}>{tierLabel(lead.tier)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={lead.status as BadgeVariant}>{statusLabel(lead.status)}</Badge>
            </TableCell>
            <TableCell align="right">
              <span className="text-stone">{relativeTime(lead.createdAt)}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
