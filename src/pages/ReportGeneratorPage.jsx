import React, { useState, useEffect } from 'react';
import { getInspection } from '../services/inspectionService';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldCheck, AlertCircle, FileCheck, CheckCircle2, Sliders, Eye } from 'lucide-react';
import { ReportConfiguration } from '../components/report/ReportConfiguration';
import { ReportSummaryCard } from '../components/report/ReportSummaryCard';
import { ReportGenerating } from '../components/report/ReportGenerating';
import { ReportPreview } from '../components/report/ReportPreview';
import { ReportActions } from '../components/report/ReportActions';
import { StatusBadge } from '../components/results/StatusBadge';

export const ReportGeneratorPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
const inspectionId = searchParams.get('inspectionId');

const [inspectionData, setInspectionData] = useState(null);
const [officerReview, setOfficerReview] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!inspectionId) {
    setLoading(false);
    return;
  }

  getInspection(inspectionId)
    .then((data) => {
      setInspectionData(data);
      setOfficerReview(data.review || null);
    })
    .catch((error) => {
      console.error('Failed to load inspection:', error);
    })
    .finally(() => {
      setLoading(false);
    });
}, [inspectionId]);

  // Phases: 'config' | 'generating' | 'preview'
  const [phase, setPhase] = useState('config');

  // Configuration options
  const [reportType, setReportType] = useState('compliance'); // 'compliance' | 'violation'
  const [reportFormat, setReportFormat] = useState('pdf'); // 'pdf' | 'print'
  const [selectedSections, setSelectedSections] = useState({
    inspectionInfo: true,
    productInfo: true,
    declarations: true,
    complianceChecks: true,
    violations: true,
    evidenceSummary: true,
    officerReview: true,
  });

  const toggleSection = (sectionKey) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const selectAllSections = () => {
    setSelectedSections({
      inspectionInfo: true,
      productInfo: true,
      declarations: true,
      complianceChecks: true,
      violations: true,
      evidenceSummary: true,
      officerReview: true,
    });
  };

  const deselectAllSections = () => {
    setSelectedSections({
      inspectionInfo: false,
      productInfo: false,
      declarations: false,
      complianceChecks: false,
      violations: false,
      evidenceSummary: false,
      officerReview: false,
    });
  };

  const handleStartGeneration = () => {
    setPhase('generating');
  };

  const handleGenerationComplete = () => {
    setPhase('preview');
  };

  const handleGenerateAgain = () => {
    setPhase('config');
  };

  const isReviewed = officerReview?.reviewStatus === 'REVIEWED';
  const finalAssessmentLabel =
  officerReview?.finalAssessment || 'Not reviewed';
  if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-slate-500">Loading inspection...</p>
    </div>
  );
}

if (!inspectionData) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-red-500">
        Inspection data could not be loaded.
      </p>
    </div>
  );
}
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Heading (hidden in print) */}
      <div className="no-print space-y-4">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Compliance Results
          </button>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            Official Report Generator
          </span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-cyan-600" />
              Generate Compliance Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create an official inspection report from the reviewed inspection findings.
            </p>
          </div>
        </div>

        {/* Inspection Header Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-sm text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Inspection ID</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {inspectionData?.inspectionId || inspectionId}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Product</span>
            <span className="font-bold text-slate-100 truncate block">
              {inspectionData?.product?.name || inspectionData?.productName || 'Unknown Product'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Officer</span>
            <span className="font-semibold text-slate-200">Officer</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Review Status</span>
            <span
              className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded mt-0.5 ${
                isReviewed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {isReviewed ? 'REVIEWED' : 'OFFICER REVIEW PENDING'}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Final Assessment</span>
            <span className="font-bold text-slate-100 truncate block text-[11px] mt-0.5">
              {finalAssessmentLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main View Area based on Phase */}
      {phase === 'config' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ReportConfiguration
                reportType={reportType}
                setReportType={setReportType}
                reportFormat={reportFormat}
                setReportFormat={setReportFormat}
                selectedSections={selectedSections}
                toggleSection={toggleSection}
                selectAllSections={selectAllSections}
                deselectAllSections={deselectAllSections}
              />
            </div>
            <div className="lg:col-span-5">
              <ReportSummaryCard
  inspectionData={inspectionData}
  officerReview={officerReview}
/>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleStartGeneration}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#0c1e33] hover:bg-slate-800 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Generate Report
            </button>
          </div>
        </div>
      )}

      {phase === 'generating' && (
        <div className="py-8">
          <ReportGenerating onComplete={handleGenerationComplete} />
        </div>
      )}

      {phase === 'preview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action toolbar */}
          <ReportActions
            onGenerateAgain={handleGenerateAgain}
            inspectionId={inspectionData?.inspectionId || inspectionId}
          />

          {/* Report Preview Document */}
          <ReportPreview
  inspectionData={inspectionData}
            officerReview={officerReview}
            reportType={reportType}
            selectedSections={selectedSections}
          />
        </div>
      )}
    </div>
  );
};
