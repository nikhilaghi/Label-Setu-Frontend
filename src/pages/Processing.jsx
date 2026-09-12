import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  FileCheck2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { getInspectionStatus } from '../services/inspectionService';

import { ProductPreview } from '../components/processing/ProductPreview';
import { ProgressBar } from '../components/processing/ProgressBar';
import { ProcessingStepper } from '../components/processing/ProcessingStepper';
import { ProcessingStatus } from '../components/processing/ProcessingStatus';
import { AIInfoBox } from '../components/processing/AIInfoBox';

export const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const inspectionId = new URLSearchParams(location.search).get(
    'inspectionId'
  );

  const [currentProgress, setCurrentProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Starting inspection...'
  );

  const imageInfo = {
    image:
      location.state?.image ||
      sessionStorage.getItem('inspectionImage') ||
      null,

    fileName:
      location.state?.fileName ||
      sessionStorage.getItem('inspectionFileName') ||
      'Inspection Image',

    fileSize:
      location.state?.fileSize ||
      sessionStorage.getItem('inspectionFileSize') ||
      '',
  };

  useEffect(() => {
    if (!inspectionId) {
      setStatusMessage('Inspection ID not found.');
      return;
    }

    let timer = null;
    let isMounted = true;

    const pollStatus = async () => {
      try {
        const status = await getInspectionStatus(inspectionId);

        console.log('REAL BACKEND STATUS:', status);

        if (!isMounted) return;

        setCurrentProgress(status.progress || 0);
        setStatusMessage(status.stage || 'Processing...');

        if (status.status === 'COMPLETED') {
          setCurrentProgress(100);
          setIsComplete(true);
          setStatusMessage('Inspection completed successfully.');

          if (timer) {
            clearInterval(timer);
          }

          setTimeout(() => {
            if (isMounted) {
              navigate(`/results?inspectionId=${inspectionId}`);
            }
          }, 500);
        }

        if (status.status === 'FAILED') {
          setStatusMessage(
            status.errorMessage || 'Processing failed.'
          );

          if (timer) {
            clearInterval(timer);
          }
        }
      } catch (error) {
        console.error('Status error:', error);

        if (isMounted) {
          setStatusMessage(
            'Unable to fetch inspection status. Retrying...'
          );
        }
      }
    };

    pollStatus();

    timer = setInterval(pollStatus, 1500);

    return () => {
      isMounted = false;

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [inspectionId, navigate]);

  if (!inspectionId) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Inspection ID Missing
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            We could not find the inspection ID. Please start a new
            inspection.
          </p>

          <Link
            to="/scanner"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
          >
            Start New Inspection
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-600" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t(
                  'processingTitle',
                  'Analyzing Product Label'
                )}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                'processingSubtitle',
                'OCR and compliance rules are analyzing the uploaded label.'
              )}
            </p>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-600" />

              <span>
                {t(
                  'inspectionStage',
                  'Inspection Stage: 2 of 4'
                )}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Inspection Pipeline Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isComplete
                  ? 'bg-emerald-50'
                  : 'bg-cyan-50'
              }`}
            >
              {isComplete ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-600 animate-pulse" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isComplete
                  ? 'Analysis Complete'
                  : 'Inspection in Progress'}
              </p>

              <p className="text-xs text-slate-500">
                Inspection ID: {inspectionId}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">
              {currentProgress}%
            </span>

            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Progress
            </p>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Product Preview */}
        <div className="space-y-4">
          <ProductPreview
            imageInfo={imageInfo}
            isAnalyzing={!isComplete}
            progress={currentProgress}
          />
        </div>

        {/* Processing Details */}
        <div className="space-y-4">

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <ProgressBar
              progress={currentProgress}
              status={statusMessage}
            />
          </div>

          {/* Processing Status */}
          <ProcessingStatus
            progress={currentProgress}
          />

          {/* Processing Steps */}
          <ProcessingStepper
            progress={currentProgress}
          />

          {/* AI Information */}
          <AIInfoBox />
        </div>
      </div>

      {/* Bottom Information */}
      <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">

          <div className="w-8 h-8 rounded-lg bg-white border border-cyan-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              {t(
                'secureInspection',
                'Secure Inspection Processing'
              )}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {t(
                'secureInspectionDesc',
                'The uploaded label is being analyzed using OCR, NLP, and deterministic Legal Metrology compliance rules.'
              )}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};