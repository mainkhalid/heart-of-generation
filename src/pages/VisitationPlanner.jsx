import React, { useState } from "react";
import {Calendar,Upload,X,Save,DollarSign,Users,Home,Clock,Loader,AlertCircle,Heart,Newspaper} from "lucide-react"; 
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const VisitationPlanner = () => {
  const [activeTab, setActiveTab] = useState("visitation");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Visitation Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          Plan visitations, manage causes, and post news updates
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="flex border-b overflow-x-auto">
          <TabButton
            icon={<Calendar className="h-4 w-4 mr-2" />}
            label="Visitation"
            active={activeTab === "visitation"}
            onClick={() => setActiveTab("visitation")}
          />
          <TabButton
            icon={<Heart className="h-4 w-4 mr-2" />}
            label="Causes"
            active={activeTab === "causes"}
            onClick={() => setActiveTab("causes")}
          />
          <TabButton
            icon={<Newspaper className="h-4 w-4 mr-2" />}
            label="News"
            active={activeTab === "news"}
            onClick={() => setActiveTab("news")}
          />
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "visitation" && <VisitationForm />}
        {activeTab === "causes" && <CausesForm />}
        {activeTab === "news" && <NewsForm />}
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center px-4 py-3 font-medium text-sm transition-colors duration-150 ${
      active
        ? "text-orange-600 border-b-2 border-orange-600"
        : "text-gray-600 hover:text-orange-600"
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const VisitationForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const createVisitation = useMutation(api.visitations.createVisitation);

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [visitationData, setVisitationData] = useState({
    homeName: "",
    visitDate: "",
    numberOfChildren: 0,
    budget: {
      transportation: 0,
      food: 0,
      supplies: 0,
      gifts: 0,
      other: 0,
    },
    notes: "",
    status: "planned",
  });

  const [validation, setValidation] = useState({
    homeName: true,
    visitDate: true,
    numberOfChildren: true,
  });

  const validateField = (name, value) => {
    switch (name) {
      case "homeName":
        return value.trim() !== "";
      case "visitDate":
        return value !== "";
      case "numberOfChildren":
        return parseInt(value) >= 0;
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitationData({ ...visitationData, [name]: value });
    setValidation({ ...validation, [name]: validateField(name, value) });
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setVisitationData({
      ...visitationData,
      budget: { ...visitationData.budget, [name]: parseFloat(value) || 0 },
    });
  };

  const getTotalBudget = () =>
    Object.values(visitationData.budget).reduce((sum, val) => sum + val, 0);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const remainingSlots = 5 - files.length;
      if (remainingSlots <= 0) {
        toast.warning("Maximum 5 images allowed");
        return;
      }

      const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots);

      const validFiles = selectedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`${file.name} exceeds 5MB limit`);
          return false;
        }
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          toast.warning(`${file.name} is not a supported format`);
          return false;
        }
        return true;
      });

      setFiles([...files, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          setPreviewUrls((prev) => [...prev, e.target.result]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "visitations");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return { url: data.secure_url, publicId: data.public_id };
  };

  const validateForm = () => {
    const newValidation = {
      homeName: validateField("homeName", visitationData.homeName),
      visitDate: validateField("visitDate", visitationData.visitDate),
      numberOfChildren: validateField(
        "numberOfChildren",
        visitationData.numberOfChildren
      ),
    };
    setValidation(newValidation);
    return Object.values(newValidation).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      let uploadedImages = [];

      if (files.length > 0) {
        const toastId = toast.loading(`Uploading images...`);
        for (let i = 0; i < files.length; i++) {
          const uploaded = await uploadImageToCloudinary(files[i]);
          uploadedImages.push(uploaded);
          toast.message(`Uploaded ${i + 1}/${files.length}`, { id: toastId });
        }
        toast.success("All images uploaded!", { id: toastId });
      }

      const payload = {
        ...visitationData,
        numberOfChildren: parseInt(visitationData.numberOfChildren),
        createdBy: user.id,
        images: uploadedImages,
      };

      const toastId = toast.loading("Saving visitation plan...");
      const result = await createVisitation(payload);

      if (result?.success) {
        toast.success("Visitation plan created successfully!", { id: toastId });
        navigate("/admin/visitation-list", { state: { refresh: true } });
      } else {
        throw new Error(result?.error || "Failed to create visitation");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error creating visitation plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Plan New Visitation
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home name */}
          <Field
            label="Children's Home Name"
            required
            icon={<Home className="h-5 w-5" />}
            name="homeName"
            type="text"
            value={visitationData.homeName}
            onChange={handleInputChange}
          />
          {/* Visit Date */}
          <Field
            label="Planned Visit Date"
            required
            icon={<Calendar className="h-5 w-5" />}
            name="visitDate"
            type="date"
            value={visitationData.visitDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split("T")[0]}
          />
          {/* Number of Children */}
          <Field
            label="Number of Children"
            required
            icon={<Users className="h-5 w-5" />}
            name="numberOfChildren"
            type="number"
            value={visitationData.numberOfChildren}
            onChange={handleInputChange}
          />
          {/* Status */}
          <SelectField
            label="Status"
            icon={<Clock className="h-5 w-5" />}
            name="status"
            value={visitationData.status}
            onChange={handleInputChange}
            options={[
              "planned",
              "in-progress",
              "completed",
              "cancelled",
            ]}
          />
        </div>

        {/* Budget */}
        <BudgetSection
          budget={visitationData.budget}
          onChange={handleBudgetChange}
          total={getTotalBudget()}
        />

        {/* Notes */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
            Visit Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={visitationData.notes}
            onChange={handleInputChange}
            rows="4"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Add any additional notes..."
          ></textarea>
        </div>

        <ImageUploadSection
          files={files}
          previewUrls={previewUrls}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
        />

        {/* Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Visitation Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const CausesForm = () => {
  const { user } = useUser();
  const createCause = useMutation(api.causes.createCause);
  
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [causeData, setCauseData] = useState({
    title: "",
    description: "",
    goalAmount: 0,
  });

  const handleChange = (e) =>
    setCauseData({ ...causeData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files) {
      const remainingSlots = 5 - files.length;
      if (remainingSlots <= 0) {
        toast.warning("Maximum 5 images allowed");
        return;
      }

      const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots);

      const validFiles = selectedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`${file.name} exceeds 5MB limit`);
          return false;
        }
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          toast.warning(`${file.name} is not a supported format`);
          return false;
        }
        return true;
      });

      setFiles([...files, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          setPreviewUrls((prev) => [...prev, e.target.result]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "causes");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!causeData.title || !causeData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let uploadedImages = [];

      if (files.length > 0) {
        const toastId = toast.loading(`Uploading images...`);
        for (let i = 0; i < files.length; i++) {
          const uploaded = await uploadImageToCloudinary(files[i]);
          uploadedImages.push(uploaded);
          toast.message(`Uploaded ${i + 1}/${files.length}`, { id: toastId });
        }
        toast.success("All images uploaded!", { id: toastId });
      }

      const payload = {
        ...causeData,
        goalAmount: parseFloat(causeData.goalAmount) || 0,
        createdBy: user.id,
        images: uploadedImages,
      };

      const toastId = toast.loading("Creating cause...");
      const result = await createCause(payload);

      if (result?.success) {
        toast.success("Cause created successfully!", { id: toastId });
        setCauseData({ title: "", description: "", goalAmount: 0 });
        setFiles([]);
        setPreviewUrls([]);
      } else {
        throw new Error(result?.error || "Failed to create cause");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error creating cause");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Create New Cause
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          label="Cause Title"
          required
          name="title"
          type="text"
          value={causeData.title}
          onChange={handleChange}
        />
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={causeData.description}
            onChange={handleChange}
            rows="6"
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe the cause..."
          ></textarea>
        </div>
        <Field
          label="Goal Amount ($)"
          name="goalAmount"
          type="number"
          value={causeData.goalAmount}
          onChange={handleChange}
        />

        {/* Images */}
        <ImageUploadSection
          files={files}
          previewUrls={previewUrls}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
        />
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Create Cause</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const NewsForm = () => {
  const { user } = useUser();
  const createNews = useMutation(api.news.createNews);
  
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) =>
    setNewsData({ ...newsData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newsData.title || !newsData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newsData,
        createdBy: user.id,
      };

      const toastId = toast.loading("Posting news...");
      const result = await createNews(payload);

      if (result?.success) {
        toast.success("News posted successfully!", { id: toastId });
        setNewsData({ title: "", description: "" });
      } else {
        throw new Error(result?.error || "Failed to post news");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error posting news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Post News</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          label="News Title"
          required
          name="title"
          type="text"
          value={newsData.title}
          onChange={handleChange}
        />
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={newsData.description}
            onChange={handleChange}
            rows="6"
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Write the news content..."
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Post News</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* -------------------- Reusable Components -------------------- */
const Field = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2" htmlFor={props.name}>
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
      {icon && <span className="px-3 py-2 bg-gray-100 text-gray-500">{icon}</span>}
      <input
        {...props}
        className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, options, ...props }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
      {icon && <span className="px-3 py-2 bg-gray-100 text-gray-500">{icon}</span>}
      <select
        {...props}
        className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const BudgetSection = ({ budget, onChange, total }) => (
  <div>
    <h4 className="text-lg font-semibold mb-3 text-gray-700">Budget Allocation</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.keys(budget).map((key) => (
        <Field
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1)}
          name={key}
          type="number"
          icon={<DollarSign className="h-4 w-4" />}
          value={budget[key]}
          onChange={onChange}
        />
      ))}
      <div>
        <label className="block text-gray-700 text-sm mb-1">Total Budget</label>
        <div className="p-2 bg-orange-50 border border-orange-200 rounded-md font-medium text-orange-700">
          ${total.toFixed(2)}
        </div>
      </div>
    </div>
  </div>
);

const ImageUploadSection = ({ files, previewUrls, onFileChange, onRemoveFile }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">Upload Images (Max 5)</label>
    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
      <input
        type="file"
        id="images"
        accept="image/jpeg,image/png,image/gif"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
      <label htmlFor="images" className="cursor-pointer">
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-700 mb-1">Drag & drop images or click to browse</p>
          <p className="text-xs text-gray-500">JPG, PNG, or GIF up to 5MB each</p>
        </div>
      </label>
    </div>
    {previewUrls.length > 0 && (
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="h-24 w-full object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);