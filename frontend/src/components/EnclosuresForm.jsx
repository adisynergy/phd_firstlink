import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "./ui/checkbox.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Button } from "./ui/button.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function EnclosuresForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    enclosures: {
      transaction_details: false,
      matriculation: false,
      intermediate: false,
      bachelors: false,
      masters: false,
      gate_net: false,
      doctors_certificate: false,
      community_certificate: false,
      experience_letter: false,
      government_id: false,
      research_publications: false
    },
    additional_info: "",
    declaration: {
      place: "",
      date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    const fetchEnclosures = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/enclosures/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        
        if (response.data.success && response.data.enclosure) {
          setFormData({
            enclosures: response.data.enclosure.enclosures,
            additional_info: response.data.enclosure.additional_info || "",
            declaration: {
              place: response.data.enclosure.declaration?.place || "",
              date: response.data.enclosure.declaration?.date || new Date().toISOString().split('T')[0]
            }
          });
        }
      } catch (error) {
        console.error('Error fetching enclosures:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to fetch enclosures');
        }
      }
    };

    fetchEnclosures();
  }, []);

  const handleCheckboxChange = (path) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = !current[keys[keys.length - 1]];
      return newData;
    });
  };

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/enclosures/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/print-application');
      }
    } catch (error) {
      console.error('Error saving enclosures:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save enclosures');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-800">List of Enclosures</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Enclosures List */}
          <div className="space-y-4">
            {[
              { id: 'transaction_details', label: 'Online Transaction Details' },
              { id: 'matriculation', label: 'Matriculation Marksheet and Certificate' },
              { id: 'intermediate', label: '+2/Intermediate/Diploma Marksheet and Certificate' },
              { id: 'bachelors', label: "Bachelor's Degree Marksheet and Certificate" },
              { id: 'masters', label: "Master's Degree Marksheet and Certificate" },
              { id: 'gate_net', label: 'GATE score/NET Certificate' },
              { id: 'doctors_certificate', label: "Doctor's Certificate (in case of PH)" },
              { id: 'community_certificate', label: 'Community Certificate' },
              { id: 'experience_letter', label: 'Experience Letter (if any)' },
              { id: 'government_id', label: 'Government ID' },
              { id: 'research_publications', label: 'Research Publication(s)' }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={formData?.enclosures?.[item.id] || false}
                  onCheckedChange={() => handleCheckboxChange(`enclosures.${item.id}`)}
                />
                <Label htmlFor={item.id} className="text-sm font-medium">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <Label htmlFor="additional_info" className="text-sm font-medium">
              Additional Information
            </Label>
            <Textarea
              id="additional_info"
              value={formData.additional_info || ""}
              onChange={(e) => handleInputChange('additional_info', e.target.value)}
              placeholder="Enter any additional information here..."
              className="min-h-[100px]"
            />
          </div>

          {/* Declaration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Declaration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="place">Place:</Label>
                <Input
                  id="place"
                  name="place"
                  value={formData.declaration.place}
                  onChange={(e) => handleInputChange('declaration.place', e.target.value)}
                  placeholder="Enter place"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date:</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.declaration.date}
                  onChange={(e) => handleInputChange('declaration.date', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 