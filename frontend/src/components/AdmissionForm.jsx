import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Button } from "./ui/button.jsx";
import { Checkbox } from "./ui/checkbox.jsx";
import { ArrowUpFromLine, Loader2, FileText } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Validation functions
const validateName = (name) => {
  if (!name) return 'Please enter your name';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 30) return 'Name cannot exceed 30 characters';
  if (!/^[a-zA-Z\s]*$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

const validateAge = (dob) => {
  if (!dob) return 'Please select your date of birth';
  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18) return 'You must be at least 18 years old to apply';
  if (age > 50) return 'Age limit for application is 50 years';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Please enter your phone number';
  if (!/^[0-9]{10}$/.test(phone)) return 'Please enter a valid 10-digit mobile number';
  return '';
};

const validatePincode = (pincode) => {
  if (!pincode) return 'Please enter your PIN code';
  if (!/^[0-9]{6}$/.test(pincode)) return 'Please enter a valid 6-digit PIN code';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Please enter your email address';
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return 'Please enter a valid email address (e.g., example@domain.com)';
  }
  return '';
};

const validateAddress = (address) => {
  if (!address.street) return 'Please enter your street address';
  if (!address.city) return 'Please enter your city';
  if (!address.state) return 'Please enter your state';
  if (!address.pincode) return 'Please enter your PIN code';
  if (!/^[0-9]{6}$/.test(address.pincode)) return 'Please enter a valid 6-digit PIN code';
  return '';
};

const validateFile = (file, type) => {
  if (!file) return `Please upload your ${type}`;
  
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} size should not exceed 2MB`;
  }

  // Check file type - only images allowed
  if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
    return `Please upload a valid image file (JPEG, PNG, or GIF) for your ${type}`;
  }

  return '';
};

// Add this helper function at the top of the file after the imports
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user: localStorage.getItem('userId'),
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    category: "",
    religion: "",
    father_name: "",
    mother_name: "",
    marital_status: "Single",
    spouse_name: "",
    email: "",
    phone: "",
    current_address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    permanent_address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    photo: null,
    signature: null,
    programme_type: "Ph.D.",
    department: "Computer Science and Engineering",
    mode_of_phd: "Full Time",
    status: "draft"
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/personal/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        
        if (response.data) {
          // Format the date before setting the form data
          const formattedData = {
            ...response.data,
            date_of_birth: formatDateForInput(response.data.date_of_birth)
          };
          setFormData(formattedData);
          setIsExistingData(true);
        }
      } catch (error) {
        console.error('Error fetching personal details:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch personal details');
        }
      }
    };

    fetchPersonalDetails();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admissionFormData', JSON.stringify(formData));
  }, [formData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
      case 'father_name':
      case 'mother_name':
        return validateName(value);
      case 'date_of_birth':
        return validateAge(value);
      case 'phone':
        return validatePhone(value);
      case 'email':
        return validateEmail(value);
      case 'gender':
        return !value ? 'Gender is required' : '';
      case 'nationality':
        return !value ? 'Nationality is required' : '';
      case 'category':
        return !value ? 'Category is required' : '';
      case 'religion':
        return !value ? 'Religion is required' : '';
      case 'marital_status':
        return !value ? 'Marital status is required' : '';
      case 'current_address':
        return validateAddress(value);
      case 'permanent_address':
        return validateAddress(value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Validate field and update errors
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSameAddressChange = (checked) => {
    setSameAddress(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permanent_address: { ...prev.current_address }
      }));
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file, type);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append(type, file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal/upload-${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data[type]) {
        setFormData(prev => ({
          ...prev,
          [type]: {
            url: response.data[type],
            type: file.type
          }
        }));
        setErrors(prev => ({ ...prev, [type]: '' }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [type]: error.response?.data?.message || `Error uploading ${type}`
      }));
      toast.error(error.response?.data?.message || `Error uploading ${type}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.first_name || !/^[a-zA-Z\s]{2,30}$/.test(formData.first_name)) {
      newErrors.first_name = 'First name must be 2-30 characters and contain only letters';
    }
    if (!formData.last_name || !/^[a-zA-Z\s]{2,30}$/.test(formData.last_name)) {
      newErrors.last_name = 'Last name must be 2-30 characters and contain only letters';
    }

    // Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 50) {
        newErrors.date_of_birth = 'Age must be between 18 and 50 years';
      }
    }

    // Email validation
    if (!formData.email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // Pincode validation
    if (!formData.current_address.pincode || !/^[0-9]{6}$/.test(formData.current_address.pincode)) {
      newErrors['current_address.pincode'] = 'Please enter a valid 6-digit PIN code';
    }
    if (!formData.permanent_address.pincode || !/^[0-9]{6}$/.test(formData.permanent_address.pincode)) {
      newErrors['permanent_address.pincode'] = 'Please enter a valid 6-digit PIN code';
    }

    // Spouse name validation
    if (formData.marital_status !== 'Single' && !formData.spouse_name) {
      newErrors.spouse_name = 'Spouse name is required for married, divorced, or widowed applicants';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(error => error);
      if (errorMessages.length > 0) {
        toast.error('Please correct the following errors:', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
        errorMessages.forEach(message => {
          toast.error(message, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Format the date to ISO string for backend
      const formattedData = {
        ...formData,
        date_of_birth: new Date(formData.date_of_birth).toISOString()
      };

      console.log('Submitting form data:', formattedData);
      
      const response = await axios({
        method: isExistingData ? 'put' : 'post',
        url: `${import.meta.env.VITE_BACKEND_URL}/api/personal/${isExistingData ? 'update' : 'create'}`,
        data: formattedData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('Server response:', response.data);

      // Clear form data from localStorage after successful submission
      localStorage.removeItem('admissionFormData');

      toast.success(`Personal details ${isExistingData ? 'updated' : 'submitted'} successfully`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });

      // Always navigate to academic details after successful submission/update
      navigate('/academic-details');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.fields) {
        const missingFields = error.response.data.fields;
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.response?.data?.message || `Failed to ${isExistingData ? 'update' : 'submit'} personal details. Please try again.`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Personal Details
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Programme Type Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Select Programme Type</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="phd"
                name="programme_type"
                value="Ph.D."
                checked={formData.programme_type === "Ph.D."}
                onChange={(e) => handleChange({ target: { name: 'programme_type', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="phd">Ph.D. Programme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="integrated_phd"
                name="programme_type"
                value="Integrated Ph.D."
                checked={formData.programme_type === "Integrated Ph.D."}
                onChange={(e) => handleChange({ target: { name: 'programme_type', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="integrated_phd">Integrated Ph.D. Programme</Label>
            </div>
          </div>
        </div>

        {/* Department Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Select Department</h2>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            <option value="Computer Science and Engineering">Computer Science and Engineering</option>
            <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Electronics and Instrumentation Engineering">Electronics and Instrumentation Engineering</option>
          </select>
          
          {/* Notes */}
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p className="font-medium">Note:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Submit separate applications for applying in one or more Departments </li>
              <li>The candidate shall submit his/her research plan in about 250 to 300 words along with his/her application</li>
            </ol>
          </div>
        </div>

        {/* Mode of PhD Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Mode of PhD</h2>
          <select
            id="mode_of_phd"
            name="mode_of_phd"
            value={formData.mode_of_phd}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Mode of PhD</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </select>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" required>First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className={errors.first_name ? "border-red-500" : ""}
              placeholder="Enter your first name"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
            )}
            <p className="text-xs text-gray-500">Must be 2-30 characters, letters only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" required>Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className={errors.last_name ? "border-red-500" : ""}
              placeholder="Enter your last name"
            />
            {errors.last_name && (
              <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
            )}
            <p className="text-xs text-gray-500">Must be 2-30 characters, letters only</p>
          </div>
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth" required>Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              className={errors.date_of_birth ? "border-red-500" : ""}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>
            )}
            <p className="text-xs text-gray-500">Age must be between 18-50 years</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" required>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange({ target: { name: 'gender', value } })}
            >
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* Nationality and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality" required>Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              placeholder="Enter your nationality"
            />
            <p className="text-xs text-gray-500">Enter your country of citizenship</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" required>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange({ target: { name: 'category', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="OBC">OBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Select your reservation category</p>
          </div>
        </div>

        {/* Physically Challenged */}
        <div className="space-y-2">
          <Label htmlFor="physically_challenged" required>Are you a Person with Disability (PwD) of 40% and above?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="physically_challenged_yes"
                name="physically_challenged"
                value="true"
                checked={formData.physically_challenged === true}
                onChange={(e) => handleChange({ target: { name: 'physically_challenged', value: e.target.value === 'true' } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="physically_challenged_yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="physically_challenged_no"
                name="physically_challenged"
                value="false"
                checked={formData.physically_challenged === false}
                onChange={(e) => handleChange({ target: { name: 'physically_challenged', value: e.target.value === 'true' } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="physically_challenged_no">No</Label>
            </div>
          </div>
          <p className="text-xs text-gray-500">Select Yes if you have a disability of 40% or more</p>
        </div>

        {/* Religion and Marital Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="religion" required>Religion</Label>
            <Input
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marital_status" required>Marital Status</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => handleChange({ target: { name: 'marital_status', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Spouse Name (Conditional) */}
        {formData.marital_status !== 'Single' && (
          <div className="space-y-2">
            <Label htmlFor="spouse_name" required>Spouse's Name</Label>
            <Input
              id="spouse_name"
              name="spouse_name"
              value={formData.spouse_name}
              onChange={handleChange}
              required
              className={errors.spouse_name ? "border-red-500" : ""}
            />
            {errors.spouse_name && (
              <p className="text-sm text-red-500 mt-1">{errors.spouse_name}</p>
            )}
          </div>
        )}

        {/* Parent Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="father_name" required>Father's Name</Label>
            <Input
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_name" required>Mother's Name</Label>
            <Input
              id="mother_name"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? "border-red-500" : ""}
              placeholder="example@domain.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500">Enter a valid email address</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" required>Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className={errors.phone ? "border-red-500" : ""}
              placeholder="10-digit mobile number"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500">Enter a valid 10-digit mobile number</p>
          </div>
        </div>

        <div>
          <Label htmlFor="current_address.pincode" required>Pincode</Label>
          <Input
            id="current_address.pincode"
            name="current_address.pincode"
            value={formData.current_address.pincode}
            onChange={handleChange}
            required
            className={errors['current_address.pincode'] ? "border-red-500" : ""}
            placeholder="6-digit pincode"
          />
          {errors['current_address.pincode'] && (
            <p className="text-sm text-red-500 mt-1">{errors['current_address.pincode']}</p>
          )}
          <p className="text-xs text-gray-500">Enter a valid 6-digit pincode</p>
        </div>

        {/* Communication Address */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Communication Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="current_address.street" required>Street Address</Label>
              <Input
                id="current_address.street"
                name="current_address.street"
                value={formData.current_address.street}
                onChange={handleChange}
                required
                placeholder="Enter your street address"
              />
              <p className="text-xs text-gray-500">Enter your complete street address</p>
            </div>
            <div className="col-span-2">
              <Label htmlFor="current_address.city" required>City</Label>
              <Input
                id="current_address.city"
                name="current_address.city"
                value={formData.current_address.city}
                onChange={handleChange}
                required
                placeholder="Enter your city"
              />
              <p className="text-xs text-gray-500">Enter your city name</p>
            </div>
            <div>
              <Label htmlFor="current_address.state" required>State</Label>
              <Input
                id="current_address.state"
                name="current_address.state"
                value={formData.current_address.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="current_address.pincode" required>Pincode</Label>
              <Input
                id="current_address.pincode"
                name="current_address.pincode"
                value={formData.current_address.pincode}
                onChange={handleChange}
                required
                className={errors['current_address.pincode'] ? "border-red-500" : ""}
                placeholder="6-digit pincode"
              />
              {errors['current_address.pincode'] && (
                <p className="text-sm text-red-500 mt-1">{errors['current_address.pincode']}</p>
              )}
              <p className="text-xs text-gray-500">Enter a valid 6-digit pincode</p>
            </div>
          </div>
        </div>

        {/* Same Address Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="same_address"
            checked={sameAddress}
            onCheckedChange={handleSameAddressChange}
          />
          <Label htmlFor="same_address">Same as Communication Address</Label>
        </div>

        {/* Permanent Address */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Permanent Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="permanent_address.street" required>Street Address</Label>
              <Input
                id="permanent_address.street"
                name="permanent_address.street"
                value={formData.permanent_address.street}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="permanent_address.city" required>City</Label>
              <Input
                id="permanent_address.city"
                name="permanent_address.city"
                value={formData.permanent_address.city}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address.state" required>State</Label>
              <Input
                id="permanent_address.state"
                name="permanent_address.state"
                value={formData.permanent_address.state}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address.pincode" required>Pincode</Label>
              <Input
                id="permanent_address.pincode"
                name="permanent_address.pincode"
                value={formData.permanent_address.pincode}
                onChange={handleChange}
                required
                disabled={sameAddress}
                className={errors['permanent_address.pincode'] ? "border-red-500" : ""}
              />
              {errors['permanent_address.pincode'] && (
                <p className="text-sm text-red-500 mt-1">{errors['permanent_address.pincode']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photo (2x2 inches)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload(e, 'photo')}
                className="h-9 text-sm"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF. Max size: 2MB. Must be 2x2 inches passport size photo
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            )}
            {formData.photo && (
              <div className="w-20 h-20 border rounded overflow-hidden relative group">
                <img
                  src={formData.photo.url}
                  alt="Photo preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                    className="text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
          {errors.photo && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.photo}
            </p>
          )}
        </div>

        {/* Signature Upload */}
        <div className="space-y-2">
          <Label>Signature</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload(e, 'signature')}
                className="h-9 text-sm"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF. Max size: 2MB
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            )}
            {formData.signature && (
              <div className="w-40 h-20 border rounded overflow-hidden relative group">
                <img
                  src={formData.signature.url}
                  alt="Signature preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, signature: null }))}
                    className="text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
          {errors.signature && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.signature}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </div>
  );
} 