import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Trash2 } from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await api.get('/resume');
      setResume(response.data.data.resume);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching resume:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Resume uploaded successfully!');
      setResume(response.data.data.resume);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('resume-file');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;

    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      await api.delete(`/resume/${resume._id}`);
      toast.success('Resume deleted successfully');
      setResume(null);
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-6">Resume Upload</h1>

        {resume ? (
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-white mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{resume.fileName}</h3>
                  <p className="text-gray-300 text-sm">
                    Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Size: {(resume.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-200 mb-4">
              Upload your resume to get personalized interview answers based on your experience.
            </p>
          </div>
        )}

        <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-white mx-auto mb-4" />
          <p className="text-white mb-4">
            {file ? file.name : 'Select a resume file (PDF, DOC, DOCX, TXT)'}
          </p>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="resume-file"
            className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md cursor-pointer"
          >
            Choose File
          </label>
        </div>

        {file && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        )}

        <div className="mt-8 bg-blue-900/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Why upload your resume?</h3>
          <ul className="text-gray-200 text-sm space-y-1">
            <li>• Get answers tailored to your specific experience</li>
            <li>• Highlight relevant skills and achievements</li>
            <li>• Improve answer quality and relevance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

