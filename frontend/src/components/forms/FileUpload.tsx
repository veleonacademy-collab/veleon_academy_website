import React, { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { http } from "../../api/http";
import toast from "react-hot-toast";

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  accept?: string;
  type?: "image" | "document" | "any";
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  folder = "academy",
  error,
  accept = "image/*,.pdf,.doc,.docx",
  type = "any",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size should be less than 50MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    setIsUploading(true);
    try {
      const response = await http.post<{ imageUrl: string }>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // The backend returns imageUrl even for files, let's just use it
      onChange(response.data.imageUrl);
      toast.success("File uploaded successfully");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null || url.includes("cloudinary");
  };

  const removeFile = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
        {label}
      </label>
      
      <div className={`mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
        error ? "border-secondary bg-secondary/5" : "border-gray-200 hover:border-primary/50 bg-gray-50/50"
      }`}>
        {value ? (
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
            {isImage(value) ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-2">
                <img 
                  src={value} 
                  alt="Uploaded preview" 
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-2">
                 <FileText className="h-8 w-8 text-primary" />
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{value.split('/').pop()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Document File</p>
                 </div>
              </div>
            )}
            <div className="flex justify-between items-center px-1">
                <a href={value} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View File</a>
                <button
                    type="button"
                    onClick={removeFile}
                    className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline"
                >
                    Remove
                </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center space-y-3 py-4"
          >
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                type === "image" ? <ImageIcon className="h-6 w-6" /> : <Upload className="h-6 w-6" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">
                {isUploading ? "Uploading..." : `Click to upload ${type === 'any' ? 'file' : type}`}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {type === "image" ? "PNG, JPG or WEBP" : "Images, PDF or DOC"} up to 50MB
              </p>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      {error && <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">{error}</p>}
    </div>
  );
};
