import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Calendar,
  Home,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Loader,
  Heart,
  Newspaper,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";


const LoadingState = () => (
  <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center">
    <Loader className="h-8 w-8 animate-spin text-orange-600 mb-3" />
    <p className="text-gray-600">Loading data...</p>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center">
    <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {icon && <span className="text-gray-500 mt-1">{icon}</span>}
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export const VisitationManagementList = () => {
  const [activeTab, setActiveTab] = useState("visitation");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Manage Content</h2>
        <p className="text-sm text-gray-600 mt-1">
          View, edit, and delete visitations, causes, and news
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="flex border-b overflow-x-auto">
          <TabButton
            icon={<Calendar className="h-4 w-4 mr-2" />}
            label="Visitations"
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
        {activeTab === "visitation" && <VisitationList />}
        {activeTab === "causes" && <CausesList />}
        {activeTab === "news" && <NewsList />}
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

const VisitationList = () => {
  const visitations = useQuery(api.visitations.getVisitations);
  const deleteVisitation = useMutation(api.visitations.deleteVisitation);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this visitation?")) return;

    try {
      const toastId = toast.loading("Deleting visitation...");
      const result = await deleteVisitation({ id });
      if (result?.success) {
        toast.success("Visitation deleted successfully!", { id: toastId });
      } else {
        throw new Error(result?.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting visitation");
    }
  };

  if (visitations === undefined) {
    return <LoadingState />;
  }

  if (visitations === null || visitations.length === 0) {
    return <EmptyState message="No visitations found" />;
  }

  return (
    <div className="space-y-4">
      {visitations?.data?.map((visitation) => (
        <div key={visitation._id} className="bg-white rounded-lg shadow p-6">
          {editingId === visitation._id ? (
            <VisitationEditForm
              visitation={visitation}
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          ) : viewingId === visitation._id ? (
            <VisitationDetail
              visitation={visitation}
              onClose={() => setViewingId(null)}
            />
          ) : (
            <VisitationCard
              visitation={visitation}
              onEdit={() => setEditingId(visitation._id)}
              onDelete={() => handleDelete(visitation._id)}
              onView={() => setViewingId(visitation._id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const VisitationCard = ({ visitation, onEdit, onDelete, onView }) => {
  const totalBudget = Object.values(visitation.budget || {}).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {visitation.homeName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(visitation.visitDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {visitation.numberOfChildren} children
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              ${totalBudget.toFixed(2)}
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                visitation.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : visitation.status === "in-progress"
                  ? "bg-blue-100 text-blue-800"
                  : visitation.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {visitation.status}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VisitationDetail = ({ visitation, onClose }) => {
  const [showBudget, setShowBudget] = useState(false);
  const totalBudget = Object.values(visitation.budget || {}).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-800">
          {visitation.homeName}
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={<Calendar className="h-5 w-5" />}
          label="Visit Date"
          value={new Date(visitation.visitDate).toLocaleDateString()}
        />
        <InfoItem
          icon={<Users className="h-5 w-5" />}
          label="Number of Children"
          value={visitation.numberOfChildren}
        />
        <InfoItem
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Budget"
          value={`$${totalBudget.toFixed(2)}`}
        />
        <InfoItem label="Status" value={visitation.status} />
      </div>

      <div>
        <button
          onClick={() => setShowBudget(!showBudget)}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          {showBudget ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
          <span>Budget Breakdown</span>
        </button>
        {showBudget && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-md">
            {Object.entries(visitation.budget || {}).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="ml-2 font-medium">${value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {visitation.notes && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
            {visitation.notes}
          </p>
        </div>
      )}

      {visitation.images && visitation.images.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visitation.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Visitation ${idx + 1}`}
                className="h-32 w-full object-cover rounded-md border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VisitationEditForm = ({ visitation, onCancel, onSuccess }) => {
  const { user } = useUser();
  const updateVisitation = useMutation(api.visitations.updateVisitation);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    homeName: visitation.homeName || "",
    visitDate: visitation.visitDate || "",
    numberOfChildren: visitation.numberOfChildren || 0,
    budget: visitation.budget || {
      transportation: 0,
      food: 0,
      supplies: 0,
      gifts: 0,
      other: 0,
    },
    notes: visitation.notes || "",
    status: visitation.status || "planned",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      budget: { ...formData.budget, [name]: parseFloat(value) || 0 },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id: visitation._id,
        ...formData,
        numberOfChildren: parseInt(formData.numberOfChildren),
      };

      const toastId = toast.loading("Updating visitation...");
      const result = await updateVisitation(payload);

      if (result?.success) {
        toast.success("Visitation updated successfully!", { id: toastId });
        onSuccess();
      } else {
        throw new Error(result?.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating visitation");
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = Object.values(formData.budget).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Edit Visitation
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Home Name
          </label>
          <input
            type="text"
            name="homeName"
            value={formData.homeName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visit Date
          </label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Children
          </label>
          <input
            type="number"
            name="numberOfChildren"
            value={formData.numberOfChildren}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Budget</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.keys(formData.budget).map((key) => (
            <div key={key}>
              <label className="block text-xs text-gray-600 mb-1 capitalize">
                {key}
              </label>
              <input
                type="number"
                name={key}
                value={formData.budget[key]}
                onChange={handleBudgetChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Total</label>
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md font-medium text-orange-700 text-sm">
              ${totalBudget.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Cancel
        </button>
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
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const CausesList = () => {
  const causes = useQuery(api.causes.getCauses);
  const deleteCause = useMutation(api.causes.deleteCause);
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this cause?")) return;

    try {
      const toastId = toast.loading("Deleting cause...");
      const result = await deleteCause({ id });
      if (result?.success) {
        toast.success("Cause deleted successfully!", { id: toastId });
      } else {
        throw new Error(result?.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting cause");
    }
  };

  if (causes === undefined) {
    return <LoadingState />;
  }

  if (causes === null || causes.length === 0) {
    return <EmptyState message="No causes found" />;
  }

  return (
    <div className="space-y-4">
      {causes?.data?.map((cause) => (
        <div key={cause._id} className="bg-white rounded-lg shadow p-6">
          {editingId === cause._id ? (
            <CauseEditForm
              cause={cause}
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          ) : (
            <CauseCard
              cause={cause}
              onEdit={() => setEditingId(cause._id)}
              onDelete={() => handleDelete(cause._id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CauseCard = ({ cause, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const progress = cause.goalAmount
    ? (cause.raisedAmount / cause.goalAmount) * 100
    : 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {cause.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {cause.description}
          </p>
          {cause.goalAmount > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  ${cause.raisedAmount || 0} raised
                </span>
                <span className="text-gray-600">
                  Goal: ${cause.goalAmount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {cause.images && cause.images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
          {cause.images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`Cause ${idx + 1}`}
              className="h-20 w-full object-cover rounded-md border"
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            Show more
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-gray-700 whitespace-pre-wrap">
            {cause.description}
          </p>
        </div>
      )}
    </div>
  );
};

const CauseEditForm = ({ cause, onCancel, onSuccess }) => {
  const updateCause = useMutation(api.causes.updateCause);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: cause.title || "",
    description: cause.description || "",
    goalAmount: cause.goalAmount || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id: cause._id,
        ...formData,
        goalAmount: parseFloat(formData.goalAmount) || 0,
      };

      const toastId = toast.loading("Updating cause...");
      const result = await updateCause(payload);

      if (result?.success) {
        toast.success("Cause updated successfully!", { id: toastId });
        onSuccess();
      } else {
        throw new Error(result?.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating cause");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Edit Cause</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Goal Amount ($)
        </label>
        <input
          type="number"
          name="goalAmount"
          value={formData.goalAmount}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Cancel
        </button>
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
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const NewsList = () => {
  const news = useQuery(api.news.getNews);
  const deleteNews = useMutation(api.news.deleteNews);
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this news post?")) return;

    try {
      const toastId = toast.loading("Deleting news...");
      const result = await deleteNews({ id });
      if (result?.success) {
        toast.success("News deleted successfully!", { id: toastId });
      } else {
        throw new Error(result?.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting news");
    }
  };

  if (news === undefined) {
    return <LoadingState />;
  }

  if (news === null || news.length === 0) {
    return <EmptyState message="No news posts found" />;
  }

  return (
    <div className="space-y-4">
      {news?.data?.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow p-6">
          {editingId === item._id ? (
            <NewsEditForm
              news={item}
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          ) : (
            <NewsCard
              news={item}
              onEdit={() => setEditingId(item._id)}
              onDelete={() => handleDelete(item._id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const NewsCard = ({ news, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {news.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            {new Date(news._creationTime).toLocaleDateString()} at{" "}
            {new Date(news._creationTime).toLocaleTimeString()}
          </p>
          <p
            className={`text-gray-600 ${
              expanded ? "" : "line-clamp-3"
            } whitespace-pre-wrap`}
          >
            {news.description}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {news.description.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-orange-600 hover:text-orange-700 flex items-center mt-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Read more
            </>
          )}
        </button>
      )}
    </div>
  );
};

const NewsEditForm = ({ news, onCancel, onSuccess }) => {
  const updateNews = useMutation(api.news.updateNews);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: news.title || "",
    description: news.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id: news._id,
        ...formData,
      };

      const toastId = toast.loading("Updating news...");
      const result = await updateNews(payload);

      if (result?.success) {
        toast.success("News updated successfully!", { id: toastId });
        onSuccess();
      } else {
        throw new Error(result?.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Edit News</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="6"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Cancel
        </button>
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
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};