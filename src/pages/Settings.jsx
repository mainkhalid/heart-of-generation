import React, { useState , useEffect} from "react";
import { toast } from "sonner";
import {
  Save,
  RefreshCcw,
  AlertCircle,
  Settings as SettingsIcon,
  Mail,
  MessageSquare,
  CreditCard,
  RotateCcw,
  Info,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure your application settings. Values default to environment variables.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="flex border-b overflow-x-auto">
          <TabButton
            icon={<SettingsIcon className="h-4 w-4 mr-2" />}
            label="General"
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          />
          <TabButton
            icon={<CreditCard className="h-4 w-4 mr-2" />}
            label="M-Pesa"
            active={activeTab === "mpesa"}
            onClick={() => setActiveTab("mpesa")}
          />
          <TabButton
            icon={<Mail className="h-4 w-4 mr-2" />}
            label="Email"
            active={activeTab === "email"}
            onClick={() => setActiveTab("email")}
          />
          <TabButton
            icon={<MessageSquare className="h-4 w-4 mr-2" />}
            label="SMS"
            active={activeTab === "sms"}
            onClick={() => setActiveTab("sms")}
          />
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "mpesa" && <MpesaConfiguration />}
        {activeTab === "email" && <EmailSettings />}
        {activeTab === "sms" && <SmsSettings />}
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center px-4 py-3 font-medium text-sm transition-colors duration-150 ${
      active
        ? "text-red-600 border-b-2 border-red-600"
        : "text-gray-600 hover:text-red-600"
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const GeneralSettings = () => {
  const data = useQuery(api.settings.get, { type: "general" });
  const save = useMutation(api.settings.update);
  const resetToDefaults = useMutation(api.settings.resetToDefaults);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
  });

  React.useEffect(() => {
    if (data) {
      setSettings({
        siteName: data.siteName || "",
        siteDescription: data.siteDescription || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await save({ type: "general", settings });
      toast.success("General settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save general settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to environment variable defaults? This will delete custom overrides.")) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await resetToDefaults({ type: "general" });
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">General Settings</h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to Defaults
        </button>
      </div>

      <InfoBanner message="These settings override environment variables. Leave empty to use defaults." />

      {!data ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <FormField
            label="Site Name"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            placeholder="From SITE_NAME env variable"
          />
          <FormField
            label="Site Description"
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleChange}
            placeholder="From SITE_DESCRIPTION env variable"
            textarea
          />
          <FormField
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={settings.contactEmail}
            onChange={handleChange}
            placeholder="From CONTACT_EMAIL env variable"
          />
          <FormField
            label="Contact Phone"
            name="contactPhone"
            value={settings.contactPhone}
            onChange={handleChange}
            placeholder="From CONTACT_PHONE env variable"
          />
          <SaveButton label="Save General Settings" loading={loading} />
        </form>
      )}
    </div>
  );
};

const MpesaConfiguration = () => {
  const data = useQuery(api.settings.get, { type: "mpesa" });
  const save = useMutation(api.settings.update);
  const resetToDefaults = useMutation(api.settings.resetToDefaults);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    baseUrl: "",
    consumerKey: "",
    consumerSecret: "",
    passKey: "",
    shortcode: "",
    callbackUrl: "",
  });

  React.useEffect(() => {
    if (data) {
      setSettings({
        baseUrl: data.baseUrl || "",
        consumerKey: data.consumerKey || "",
        consumerSecret: data.consumerSecret || "",
        passKey: data.passKey || "",
        shortcode: data.shortcode || "",
        callbackUrl: data.callbackUrl || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await save({ type: "mpesa", settings });
      toast.success("M-Pesa settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save M-Pesa settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to environment variable defaults?")) return;
    
    setLoading(true);
    try {
      const result = await resetToDefaults({ type: "mpesa" });
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">M-Pesa Configuration</h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to Defaults
        </button>
      </div>

      <InfoBanner message="Configure M-Pesa STK Push integration. Uses environment variables by default." />

      {!data ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <FormField
            label="Base URL"
            name="baseUrl"
            value={settings.baseUrl}
            onChange={handleChange}
            placeholder="From MPESA_BASE_URL env variable"
          />
          <FormField
            label="Consumer Key"
            name="consumerKey"
            value={settings.consumerKey}
            onChange={handleChange}
            placeholder="From MPESA_CONSUMER_KEY env variable"
          />
          <FormField
            label="Consumer Secret"
            type="password"
            name="consumerSecret"
            value={settings.consumerSecret}
            onChange={handleChange}
            placeholder="From MPESA_CONSUMER_SECRET env variable"
          />
          <FormField
            label="Pass Key"
            name="passKey"
            value={settings.passKey}
            onChange={handleChange}
            placeholder="From MPESA_PASS_KEY env variable"
          />
          <FormField
            label="Shortcode"
            name="shortcode"
            value={settings.shortcode}
            onChange={handleChange}
            placeholder="From MPESA_SHORTCODE env variable"
          />
          <FormField
            label="Callback URL"
            name="callbackUrl"
            value={settings.callbackUrl}
            onChange={handleChange}
            placeholder="From MPESA_CALLBACK_URL env variable"
          />
          <SaveButton label="Save M-Pesa Settings" loading={loading} />
        </form>
      )}
    </div>
  );
};
export const EmailSettings = () => {
  const data = useQuery(api.settings.get, { type: "email" });
  const save = useMutation(api.settings.update);
  const resetToDefaults = useMutation(api.settings.resetToDefaults);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    emailFrom: "",
    emailFromName: "",
    resendApiKey: "",
  });

  useEffect(() => {
    if (data) {
      setSettings({
        emailFrom: data.emailFrom || "",
        emailFromName: data.emailFromName || "",
        resendApiKey: data.resendApiKey || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await save({ type: "email", settings });
      toast.success("Email settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to environment variable defaults?")) return;

    setLoading(true);
    try {
      const result = await resetToDefaults({ type: "email" });
      toast.success(result.message);
      setSettings(result.defaults);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset email settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Email Configuration</h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to Defaults
        </button>
      </div>

      <InfoBanner message="Configure Resend email service. Uses environment variables by default." />

      {!data ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <FormField
            label="From Email"
            name="emailFrom"
            type="email"
            value={settings.emailFrom}
            onChange={handleChange}
            placeholder="From EMAIL_FROM env variable"
          />
          <FormField
            label="From Name"
            name="emailFromName"
            value={settings.emailFromName}
            onChange={handleChange}
            placeholder="From EMAIL_FROM_NAME env variable"
          />
          <FormField
            label="Resend API Key"
            name="resendApiKey"
            type="password"
            value={settings.resendApiKey}
            onChange={handleChange}
            placeholder="Your Resend API Key"
          />
          <SaveButton label="Save Email Settings" loading={loading} />
        </form>
      )}
    </div>
  );
};
const SmsSettings = () => {
  const data = useQuery(api.settings.get, { type: "sms" });
  const save = useMutation(api.settings.update);
  const resetToDefaults = useMutation(api.settings.resetToDefaults);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    smsApiUrl: "",
    smsApiKey: "",
    smsSenderId: "",
  });

  React.useEffect(() => {
    if (data) {
      setSettings({
        smsApiUrl: data.smsApiUrl || "",
        smsApiKey: data.smsApiKey || "",
        smsSenderId: data.smsSenderId || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await save({ type: "sms", settings });
      toast.success("SMS settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save SMS settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to environment variable defaults?")) return;
    
    setLoading(true);
    try {
      const result = await resetToDefaults({ type: "sms" });
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">SMS Configuration</h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to Defaults
        </button>
      </div>

      <InfoBanner message="SMS gateway configuration. Uses environment variables by default." />

      {!data ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <FormField
            label="SMS API URL"
            name="smsApiUrl"
            value={settings.smsApiUrl}
            onChange={handleChange}
            placeholder="From SMS_API_URL env variable"
          />
          <FormField
            label="SMS API Key"
            name="smsApiKey"
            type="password"
            value={settings.smsApiKey}
            onChange={handleChange}
            placeholder="From SMS_API_KEY env variable"
          />
          <FormField
            label="SMS Sender ID"
            name="smsSenderId"
            value={settings.smsSenderId}
            onChange={handleChange}
            placeholder="From SMS_SENDER_ID env variable"
          />
          <SaveButton label="Save SMS Settings" loading={loading} />
        </form>
      )}
    </div>
  );
};

// --- Reusable components ---
const InfoBanner = ({ message }) => (
  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
    <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-blue-800">{message}</p>
  </div>
);

const LoadingIndicator = () => (
  <div className="py-8 text-center">
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
    <p className="mt-2 text-gray-600">Loading settings...</p>
  </div>
);

const SaveButton = ({ label, loading }) => (
  <button
    type="submit"
    disabled={loading}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Saving...
      </>
    ) : (
      <>
        <Save className="h-4 w-4 mr-2" />
        {label}
      </>
    )}
  </button>
);

const FormField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  textarea = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {textarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
      />
    )}
  </div>
);