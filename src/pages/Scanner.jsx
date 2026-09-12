import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck2,
  Info,
} from 'lucide-react';

import { uploadInspection } from '../services/inspectionService';
import { UploadDropzone } from '../components/scanner/UploadDropzone';
import { ImagePreview } from '../components/scanner/ImagePreview';
import { CameraModal } from '../components/scanner/CameraModal';
import { useToast } from '../components/common/Toast';
import { useLanguage } from '../context/LanguageContext';

export const Scanner = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (file) => {
    setSelectedFile(file);
    setIsUploading(true);

    try {
      const result = await uploadInspection(file);

      console.log('REAL BACKEND RESULT:', result);

      navigate(`/processing?inspectionId=${result.inspectionId}`, {
        state: {
          image: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);

      alert('Failed to process image: ' + error.message);

      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);

    addToast({
      title: 'Image Removed',
      message:
        'Product image cleared. You can select or capture a new one.',
      type: 'info',
    });
  };

  const handleReplaceImage = () => {
    setSelectedFile(null);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb / Back button & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToDashboard}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-colors mr-1 cursor-pointer"
              title={t(
                'returnToDashboard',
                'Return to Dashboard'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('newInspectionTitle', 'New Inspection')}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 pl-8">
            {t(
              'uploadOrCapture',
              'Upload or capture a packaged commodity label for inspection.'
            )}
          </p>
        </div>

        {/* Legal Metrology Verification Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto pl-8 sm:pl-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-600" />

            <span>
              {t(
                'inspectionStage',
                'Inspection Stage: 1 of 4'
              )}
            </span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedFile ? (
        /* Initial Selection & Upload Dropzone */
        <div className="space-y-6 animate-in fade-in">
          <UploadDropzone
            onFileSelected={handleFileSelected}
            onOpenCamera={() => setIsCameraOpen(true)}
          />

          {/* Verification Protocol Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Info className="w-4 h-4 text-cyan-600" />

              <span>
                {t(
                  'inspectionGuidelines',
                  'Inspection Guidelines for Legal Metrology Verification'
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {t(
                    'principalDisplayPanel',
                    '1. Principal Display Panel'
                  )}
                </span>

                <p className="text-slate-500 text-[11px]">
                  {t(
                    'principalDisplayPanelDesc',
                    'Ensure the primary commodity name, net weight/volume, and brand are in clear focus.'
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {t(
                    'mandatoryDeclarationsGuide',
                    '2. Mandatory Declarations'
                  )}
                </span>

                <p className="text-slate-500 text-[11px]">
                  {t(
                    'mandatoryDeclarationsDesc',
                    'MRP (incl. of all taxes), Consumer Care details, and packer address must not be obscured.'
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {t(
                    'lightingClarity',
                    '3. Lighting & Clarity'
                  )}
                </span>

                <p className="text-slate-500 text-[11px]">
                  {t(
                    'lightingClarityDesc',
                    'Avoid flash reflection, shadows, or cropped corners on the commodity package.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Uploaded Image Preview & Ready for Inspection State */
        <div className="animate-in fade-in zoom-in-98">
          <ImagePreview
            file={selectedFile}
            onReplace={handleReplaceImage}
            onRemove={handleRemoveImage}
          />

          {/* Uploading indicator */}
          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-cyan-600 rounded-full animate-spin" />
              <span>Uploading image for inspection...</span>
            </div>
          )}
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleFileSelected}
      />
    </div>
  );
};