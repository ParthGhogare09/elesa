import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Award,
  UserCheck,
  Trophy,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function ReportsManagement() {
  const downloadReport = (type) => {
    const students = demoService.getStudents();
    const groups = demoService.getGroups();
    const panels = demoService.getPanels();
    const judges = demoService.getUsers().filter((u) => u.role === 'judge');
    const gdEvals = demoService.getGDEvaluations();
    const quals = demoService.getQualifications();
    const hrEvals = demoService.getInterviewEvaluations();
    const finalResults = demoService.getFinalResults();

    let filename = '';
    let headers = [];
    let rows = [];

    if (type === 'gd') {
      filename = `PlacePro_GD_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Registration ID',
        'Student Name',
        'Branch',
        'Group',
        'Panel',
        'Evaluating Judge',
        'Comm (10)',
        'Clarity (10)',
        'Confidence (10)',
        'Reasoning (10)',
        'Teamwork (10)',
        'Initiative (10)',
        'Total GD Score (60)',
        'Percentage',
        'Judge Remarks',
        'Shortlisted for R2',
      ];
      rows = gdEvals.map((e) => {
        const s = students.find((std) => std.id === e.studentId);
        const g = groups.find((grp) => grp.id === e.groupId);
        const p = panels.find((pnl) => pnl.id === g?.panelId);
        const j = judges.find((jdg) => jdg.id === e.judgeId);
        return [
          `"${s?.registrationId || ''}"`,
          `"${s?.name || ''}"`,
          `"${s?.branch || ''}"`,
          `"${g?.groupName || ''}"`,
          `"${p?.code || ''}"`,
          `"${j?.name || ''}"`,
          e.criterionScores?.comm || 0,
          e.criterionScores?.clarity || 0,
          e.criterionScores?.confidence || 0,
          e.criterionScores?.reasoning || 0,
          e.criterionScores?.teamwork || 0,
          e.criterionScores?.initiative || 0,
          e.totalScore,
          `${e.percentage}%`,
          `"${e.remarks?.replace(/"/g, '""') || ''}"`,
          e.recommendation ? 'Yes' : 'No',
        ].join(',');
      });
    } else if (type === 'qual') {
      filename = `PlacePro_Qualification_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Registration ID',
        'Student Name',
        'Branch',
        'Group',
        'Panel',
        'GD Total (/60)',
        'GD %',
        'Judge Recommendation',
        'Admin Decision',
        'HR Eligibility',
        'Remarks',
      ];
      rows = quals.map((q) => {
        const s = students.find((std) => std.id === q.studentId);
        const g = groups.find((grp) => grp.id === q.groupId);
        const p = panels.find((pnl) => pnl.id === q.panelId);
        return [
          `"${s?.registrationId || ''}"`,
          `"${s?.name || ''}"`,
          `"${s?.branch || ''}"`,
          `"${g?.groupName || ''}"`,
          `"${p?.code || ''}"`,
          q.gdScore,
          `${q.gdPercentage}%`,
          q.recommendedByJudges?.length > 0 ? 'Recommended' : 'No',
          q.status,
          q.status === 'qualified' ? 'Eligible' : 'Ineligible',
          `"${q.remarks || ''}"`,
        ].join(',');
      });
    } else if (type === 'hr') {
      filename = `PlacePro_HR_Interviews_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Registration ID',
        'Student Name',
        'HR Evaluator ID',
        'Comm (10)',
        'Confidence (10)',
        'Problem Solving (10)',
        'Technical (10)',
        'Attitude (10)',
        'Total Interview (/50)',
        'Percentage',
        'Strengths',
        'Improvement Areas',
        'Remarks',
        'Recommendation',
      ];
      rows = hrEvals.map((h) => {
        const s = students.find((std) => std.id === h.studentId);
        return [
          `"${s?.registrationId || ''}"`,
          `"${s?.name || ''}"`,
          `"${h.hrId}"`,
          h.criterionScores?.comm || 0,
          h.criterionScores?.confidence || 0,
          h.criterionScores?.problem_solving || 0,
          h.criterionScores?.technical || 0,
          h.criterionScores?.attitude || 0,
          h.totalScore,
          `${h.percentage}%`,
          `"${h.strengths?.replace(/"/g, '""') || ''}"`,
          `"${h.improvementAreas?.replace(/"/g, '""') || ''}"`,
          `"${h.remarks?.replace(/"/g, '""') || ''}"`,
          `"${h.recommendation || ''}"`,
        ].join(',');
      });
    } else if (type === 'final') {
      filename = `PlacePro_Final_Merit_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Rank',
        'Registration ID',
        'Student Name',
        'Branch',
        'Group',
        'Panel',
        'GD Score (/60)',
        'GD % (40% Weight)',
        'HR Combined (/50)',
        'HR % (60% Weight)',
        'Final Composite (/100)',
        'Selection Status',
      ];
      rows = finalResults.map((r) => {
        const s = students.find((std) => std.id === r.studentId);
        const g = groups.find((grp) => grp.id === r.groupId);
        const p = panels.find((pnl) => pnl.id === r.panelId);
        return [
          r.rank,
          `"${s?.registrationId || ''}"`,
          `"${s?.name || ''}"`,
          `"${s?.branch || ''}"`,
          `"${g?.groupName || ''}"`,
          `"${p?.code || ''}"`,
          r.gdScore,
          `${r.gdPercentage}%`,
          r.hrScore,
          `${r.hrPercentage}%`,
          r.finalScore,
          r.selectionStatus,
        ].join(',');
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportCards = [
    {
      id: 'gd',
      title: 'Group Discussion Evaluation Report',
      description: 'Contains complete student-level criterion scores (Communication, Clarity, Confidence, Reasoning, Teamwork, Initiative out of 60), judge qualitative observations, and advisory shortlists.',
      icon: Users,
      badge: 'Round 1 Details',
    },
    {
      id: 'qual',
      title: 'Round 1 Qualification & Shortlist Report',
      description: 'Records official administrator qualification decisions, GD scores, judge advisory recommendations, and eligibility status for Round 2 HR interviews.',
      icon: CheckCircle2,
      badge: 'Shortlist Audit',
    },
    {
      id: 'hr',
      title: 'HR Interview Evaluation Report',
      description: 'Breakdown of 5 interview criteria (out of 50 total), candidate strengths, growth areas, qualitative observations, and recommendations submitted by HR 1 and HR 2.',
      icon: UserCheck,
      badge: 'Round 2 Dossier',
    },
    {
      id: 'final',
      title: 'Final Composite Merit & Offer Rollout Report',
      description: 'Full official merit rankings computed using the 40% GD + 60% HR composite scoring equation, tie-breaking resolutions, and offer selection outcomes.',
      icon: Trophy,
      badge: 'Final Leaderboard',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports, Audits &amp; Data Exports"
        subtitle="Export verified tabular datasets across all placement evaluation stages in CSV format."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.id} className="flex flex-col justify-between" noPadding>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="blue" size="sm">{card.badge}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{card.description}</p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Standard CSV Format</span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => downloadReport(card.id)}
                >
                  Download CSV
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
