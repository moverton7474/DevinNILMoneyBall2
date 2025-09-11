import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle, CheckCircle, Users, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface RosterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (sessionId: string, players: any[]) => void;
}

export const RosterUploadModal: React.FC<RosterUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Enhanced column mappings for common spreadsheet formats
  const columnMappings: Record<string, string> = {
    'Player Name': 'name',
    'Name': 'name',
    'Full Name': 'name',
    'ATHLETE': 'name',
    'Position': 'position',
    'Pos': 'position',
    'POS': 'position',
    'Class': 'position',
    'Height': 'height',
    'HT': 'height',
    'Ht': 'height',
    'HEIGHT': 'height',
    'Weight': 'weight',
    'WT': 'weight',
    'Wt': 'weight',
    'WEIGHT': 'weight',
    'Week 1': 'weight', // Sometimes weight is in "Week 1" column
    'Hometown': 'hometown',
    'Home Town': 'hometown',
    'HOMETOWN': 'hometown',
    'Previous School': 'previous_school',
    'School': 'previous_school',
    'Last School': 'previous_school',
    'ST': 'previous_school',
    'SCHOOL': 'previous_school',
    'GPA': 'gpa',
    'Grade Point Average': 'gpa',
    'Academic GPA': 'gpa',
    'Eligibility': 'years_eligibility_remaining',
    'Years Left': 'years_eligibility_remaining',
    'Years Remaining': 'years_eligibility_remaining',
    'YRS': 'years_eligibility_remaining',
    'Conference': 'conference',
    'CONF': 'conference',
    'Transfer From': 'transfer_from',
    'Division': 'transfer_from',
    'Division (GS/FCS/D2/D3)': 'transfer_from',
    'Market Value': 'market_value',
    'NIL Value': 'market_value',
    'Value': 'market_value',
    'EVAL?': 'market_value',
    'Home State': 'home_state',
    'STATE': 'home_state',
    'State': 'home_state'
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setUploadStatus('idle');
      setErrors([]);
      processFile(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10485760 // 10MB
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setErrors(results.errors.map(e => e.message));
            } else {
              handleParsedData(results.data);
            }
          },
          error: (error) => {
            setErrors([`CSV parsing error: ${error.message}`]);
          }
        });
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        handleParsedData(jsonData);
      }
    } catch (error) {
      setErrors([`File processing error: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParsedData = (data: any[]) => {
    if (data.length === 0) {
      setErrors(['No data found in file']);
      return;
    }

    // Auto-detect column mappings
    const headers = Object.keys(data[0]);
    const autoMapping: Record<string, string> = {};
    
    headers.forEach(header => {
      const trimmedHeader = header.trim();
      if (columnMappings[trimmedHeader]) {
        autoMapping[header] = columnMappings[trimmedHeader];
      } else {
        // Fuzzy matching for variations
        const lowerHeader = trimmedHeader.toLowerCase();
        for (const [key, value] of Object.entries(columnMappings)) {
          if (key.toLowerCase().includes(lowerHeader) || lowerHeader.includes(key.toLowerCase())) {
            autoMapping[header] = value;
            break;
          }
        }
      }
    });
    
    setMapping(autoMapping);
    setPreview(data.slice(0, 10)); // Show first 10 rows
    
    // Validation check
    const mappedFields = Object.values(autoMapping);
    const hasCriticalFields = mappedFields.includes('name') && mappedFields.includes('position');
    
    if (!hasCriticalFields) {
      setErrors(['Critical fields missing: Name and Position must be mapped']);
    }
  };

  const validateAndUpload = async () => {
    setIsProcessing(true);
    setUploadStatus('uploading');
    
    // Final validation
    const mappedFields = Object.values(mapping);
    if (!mappedFields.includes('name') || !mappedFields.includes('position')) {
      setErrors(['Name and Position fields are required']);
      setIsProcessing(false);
      setUploadStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/v1/roster/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players: preview.length > 10 ? preview.concat(preview.slice(10)) : preview, // Send all data, not just preview
          mapping: mapping,
          filename: file?.name || 'roster_upload.csv'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus('success');
        
        // Show detailed success feedback
        toast.success(
          `✅ Import Complete! 
          Successfully imported ${result.imported} players.
          ${result.failed > 0 ? `${result.failed} failed to import.` : ''}
          Redirecting to Transfer Portal...`,
          { duration: 5000 }
        );
        
        // Store session for later reference
        sessionStorage.setItem('lastUploadSession', result.session_id);
        
        // Notify parent component with session ID and players
        setTimeout(() => {
          onUploadComplete(result.session_id, result.players);
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrors([result.error || 'Upload failed']);
        toast.error(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrors(['Network error - unable to connect to server']);
      toast.error('Network error during upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setMapping({});
    setErrors([]);
    setUploadStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Upload Roster</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {uploadStatus === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-800">Upload Successful!</h3>
              <p className="text-gray-600 mb-4">
                Players have been imported and are ready for Baron Hopson analysis
              </p>
              <div className="text-sm text-gray-500">
                Redirecting to Transfer Portal...
              </div>
            </div>
          ) : !file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl mb-2 text-gray-700">
                {isDragActive ? 'Drop the roster file here' : 'Drop your roster file here, or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV, XLS, XLSX files (maximum 10MB)
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <strong>Expected columns:</strong> Name, Position, Height, Weight, Previous School, GPA, etc.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium">{file.name}</span>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {preview.length} rows detected
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove File
                </button>
              </div>

              {/* Error Display */}
              {errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-700 mb-2">Validation Errors:</p>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Column Mapping */}
              {preview.length > 0 && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Column Mapping
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {Object.keys(preview[0]).map(column => (
                        <div key={column} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">
                              {column}
                            </label>
                          </div>
                          <div className="flex-1">
                            <select
                              value={mapping[column] || ''}
                              onChange={(e) => setMapping({
                                ...mapping,
                                [column]: e.target.value
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">-- Skip Column --</option>
                              <option value="name">Name</option>
                              <option value="position">Position</option>
                              <option value="height">Height</option>
                              <option value="weight">Weight</option>
                              <option value="hometown">Hometown</option>
                              <option value="home_state">Home State</option>
                              <option value="previous_school">Previous School</option>
                              <option value="conference">Conference</option>
                              <option value="transfer_from">Transfer From</option>
                              <option value="gpa">GPA</option>
                              <option value="years_eligibility_remaining">Years Eligibility</option>
                              <option value="market_value">Market Value</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Data Preview (First 5 rows)</h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(preview[0]).map(header => (
                              <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {preview.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {Object.values(row).map((value: any, colIdx) => (
                                <td key={colIdx} className="px-4 py-3 text-sm text-gray-900 max-w-32 truncate">
                                  {value?.toString() || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {file && preview.length > 0 && uploadStatus !== 'success' && (
              <span>Ready to import {preview.length} players</span>
            )}
            {uploadStatus === 'uploading' && (
              <span className="text-blue-600 font-medium">Uploading and processing...</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {uploadStatus !== 'success' && (
              <Button
                onClick={validateAndUpload}
                disabled={!file || preview.length === 0 || isProcessing || errors.length > 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {uploadStatus === 'uploading' ? 'Importing...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {preview.length} Players
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
