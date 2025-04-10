import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Printer, Loader2, Combine } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { PDFDocument, rgb } from 'pdf-lib';
import { pdf } from '@react-pdf/renderer';
import { Input } from './ui/input';
import { ensureHttps } from '../utils/urlUtils';
import { Label } from './ui/label';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#000',
  },
  fullWidth: {
    width: '100%',
    fontSize: 12,
    marginBottom: 5,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  },
  documentContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  documentImage: {
    width: 300,
    height: 400,
    objectFit: 'contain',
  },
  photo: {
    width: 144, // 2 inches at 72 DPI
    height: 144, // 2 inches at 72 DPI
    objectFit: 'cover',
  },
  signature: {
    width: 216, // 3 inches at 72 DPI
    height: 72, // 1 inch at 72 DPI
    objectFit: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  personalDetails: {
    flex: 1,
    marginRight: 20,
  },
  photoSignatureContainer: {
    width: 200,
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 20,
  },
  photoContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
    backgroundColor: '#fff',
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
    color: '#666',
  },
  signatureLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
    color: '#666',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
});

// PDF Document Component
const ApplicationPDF = ({ personalDetails, academicDetails, applicationNumber, enclosures, payment, declaration }) => (
  <>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PhD Admission Application</Text>
        <Text style={styles.subtitle}>Application Number: {applicationNumber}</Text>
      </View>

      {/* Personal Details Section with Photo and Signature */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View style={styles.personalDetails}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{personalDetails?.first_name} {personalDetails?.last_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{personalDetails?.date_of_birth ? new Date(personalDetails.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Not specified'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{personalDetails?.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nationality</Text>
              <Text style={styles.value}>{personalDetails?.nationality}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{personalDetails?.category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Religion</Text>
              <Text style={styles.value}>{personalDetails?.religion}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Father's Name</Text>
              <Text style={styles.value}>{personalDetails?.father_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mother's Name</Text>
              <Text style={styles.value}>{personalDetails?.mother_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Marital Status</Text>
              <Text style={styles.value}>{personalDetails?.marital_status}</Text>
            </View>
            {personalDetails?.marital_status !== 'Single' && (
              <View style={styles.row}>
                <Text style={styles.label}>Spouse Name</Text>
                <Text style={styles.value}>{personalDetails?.spouse_name}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{personalDetails?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{personalDetails?.phone}</Text>
            </View>
            {personalDetails?.alternate_phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Alternate Phone</Text>
                <Text style={styles.value}>{personalDetails.alternate_phone}</Text>
              </View>
            )}
          </View>
          
          {/* Photo and Signature - Moved to top right */}
          <View style={styles.photoSignatureContainer}>
            {personalDetails?.photo?.url && (
              <View style={styles.photoContainer}>
                <Text style={styles.photoLabel}>Recent Photograph</Text>
                <Image
                  src={personalDetails.photo.url}
                  style={styles.photo}
                  cache={false}
                />
              </View>
            )}
            {personalDetails?.signature?.url && (
              <View style={styles.signatureContainer}>
                <Text style={styles.signatureLabel}>Signature</Text>
                <Image
                  src={personalDetails.signature.url}
                  style={styles.signature}
                  cache={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication Address</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Current Address</Text>
          <View style={styles.value}>
            <Text>{personalDetails?.current_address?.street || 'Not specified'}</Text>
            {personalDetails?.current_address?.line2 && (
              <Text>{personalDetails.current_address.line2}</Text>
            )}
            {personalDetails?.current_address?.line3 && (
              <Text>{personalDetails.current_address.line3}</Text>
            )}
            <Text>
              {personalDetails?.current_address?.city || 'Not specified'}, {personalDetails?.current_address?.state || 'Not specified'} - {personalDetails?.current_address?.pincode || 'Not specified'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Permanent Address</Text>
          <View style={styles.value}>
            <Text>{personalDetails?.permanent_address?.street || 'Not specified'}</Text>
            {personalDetails?.permanent_address?.line2 && (
              <Text>{personalDetails.permanent_address.line2}</Text>
            )}
            {personalDetails?.permanent_address?.line3 && (
              <Text>{personalDetails.permanent_address.line3}</Text>
            )}
            <Text>
              {personalDetails?.permanent_address?.city || 'Not specified'}, {personalDetails?.permanent_address?.state || 'Not specified'} - {personalDetails?.permanent_address?.pincode || 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Academic Qualifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Qualifications</Text>
        {(academicDetails?.qualifications || []).map((qual, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{qual.standard}</Text>
            <View style={styles.value}>
              <Text>{qual.degree_name}</Text>
              <Text>{qual.university}</Text>
              <Text>Year: {qual.year_of_completion}</Text>
              <Text>Marks: {qual.marks_obtained} {qual.marks_type}</Text>
              {qual.branch && <Text>Branch: {qual.branch}</Text>}
              <Text>Duration: {qual.program_duration_months} months</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {(academicDetails?.experience || []).map((exp, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{exp.type}</Text>
            <View style={styles.value}>
              <Text>Organization: {exp.organisation}</Text>
              <Text>Place: {exp.place}</Text>
              <Text>Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</Text>
              <Text>Designation: {exp.designation}</Text>
              <Text>Monthly Compensation: {exp.monthly_compensation}</Text>
              <Text>Nature of Work: {exp.nature_of_work}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Publications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications</Text>
        {(academicDetails?.publications || []).map((pub, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{pub.type}</Text>
            <View style={styles.value}>
              <Text>Title: {pub.paper_title}</Text>
              <Text>Affiliation: {pub.affiliation}</Text>
              <Text>Year: {pub.acceptance_year}</Text>
            </View>
            </View>
        ))}
      </View>

      {/* Mode of PhD Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode of PhD</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Mode</Text>
          <Text style={styles.value}>{personalDetails?.mode_of_phd || 'Not specified'}</Text>
        </View>
      </View>

      {/* Examination Results Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Examination Results</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Bachelor's Degree</Text>
          <View style={styles.value}>
            <Text>Branch: {academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.branch || 'Not specified'}</Text>
            <Text>Aggregate/CGPA: {academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.cgpa || 'Not specified'}</Text>
            <Text>Class: {academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.class || 'Not specified'}</Text>
            <Text>% of Marks/GPA: {academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.percentage || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Semester-wise Marks</Text>
          <View style={styles.value}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Semester I</Text>
                <Text style={styles.tableHeader}>Semester II</Text>
                <Text style={styles.tableHeader}>Semester III</Text>
                <Text style={styles.tableHeader}>Semester IV</Text>
                <Text style={styles.tableHeader}>Semester V</Text>
                <Text style={styles.tableHeader}>Semester VI</Text>
                <Text style={styles.tableHeader}>Semester VII</Text>
                <Text style={styles.tableHeader}>Semester VIII</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.I?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.II?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.III?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.IV?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.V?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VI?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VII?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VIII?.marks || '-'}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Master's Degree</Text>
          <View style={styles.value}>
            <Text>Branch: {academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.branch || 'Not specified'}</Text>
            <Text>Aggregate/CGPA: {academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.cgpa || 'Not specified'}</Text>
            <Text>Class: {academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.class || 'Not specified'}</Text>
            <Text>% of Marks/GPA: {academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.percentage || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Semester-wise Marks</Text>
          <View style={styles.value}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Semester I</Text>
                <Text style={styles.tableHeader}>Semester II</Text>
                <Text style={styles.tableHeader}>Semester III</Text>
                <Text style={styles.tableHeader}>Semester IV</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.I?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.II?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.III?.marks || '-'}</Text>
                <Text style={styles.tableCell}>{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.IV?.marks || '-'}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Other Degree/Diploma</Text>
          <View style={styles.value}>
            <Text>{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.degree_name || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      {/* Additional Qualifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Qualifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>GATE Details</Text>
          <View style={styles.value}>
            <Text>Score: {academicDetails?.additional_qualifications?.find(q => q.exam_type === 'GATE')?.score || 'Not specified'}</Text>
            <Text>Qualifying Year: {academicDetails?.additional_qualifications?.find(q => q.exam_type === 'GATE')?.qualifying_year || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NET/CSIR/UGC/JRF/Lectureship/NBHM/Others</Text>
          <View style={styles.value}>
            <Text>Examination: {academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.exam_name || 'Not specified'}</Text>
            <Text>Date of Exam: {academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.date_of_exam || 'Not specified'}</Text>
            <Text>Qualifying Year: {academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.qualifying_year || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      {/* Project Titles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Titles</Text>
        <View style={styles.row}>
          <Text style={styles.label}>UG Project Title</Text>
          <View style={styles.value}>
            <Text>{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.project_title || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PG Project Title</Text>
          <View style={styles.value}>
            <Text>{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.project_title || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      {/* Interested Area of Research Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interested Area of Research</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Department</Text>
          <View style={styles.value}>
            <Text>{academicDetails?.research_interest?.branch || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Specialization/Area of Research</Text>
          <View style={styles.value}>
            <Text>{academicDetails?.research_interest?.area || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      {/* Enclosure Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>List of Enclosures</Text>
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
          <View key={item.id} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.value}>
              <Text style={{ fontSize: 14 }}>{enclosures?.enclosure?.enclosures?.[item.id] ? 'Ticked' : 'Not Ticked'}</Text>
            </View>
          </View>
        ))}

        {enclosures?.enclosure?.additional_info && (
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.label}>Additional Information</Text>
            <View style={styles.value}>
              <Text style={styles.fullWidth}>{enclosures.enclosure.additional_info}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.value}>{payment?.data?.transaction_id || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Date</Text>
          <Text style={styles.value}>{payment?.data?.transaction_date ? new Date(payment.data.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Issued Bank</Text>
          <Text style={styles.value}>{payment?.data?.issued_bank || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₹{payment?.data?.amount || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{payment?.data?.status || 'Not specified'}</Text>
        </View>
        {payment?.data?.screenshot?.url && (
          <View style={styles.imageContainer}>
            <Text style={styles.documentTitle}>Transaction Screenshot</Text>
            <Image
              src={payment.data.screenshot.url}
              style={styles.documentImage}
              cache={false}
            />
          </View>
        )}
      </View>

      {/* Declaration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DECLARATION</Text>
        <Text style={styles.fullWidth}>
          I hereby declare that I have carefully read the instructions and particulars relevant to this admission and that the entries made in this application form are correct to the best of my knowledge and belief.
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Place:</Text>
          <Text style={styles.value}>{enclosures?.enclosure?.declaration?.place || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{enclosures?.enclosure?.declaration?.date ? new Date(enclosures.enclosure.declaration.date).toLocaleDateString() : 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Signature</Text>
          <View style={styles.value}>
            {personalDetails?.signature?.url ? (
              <Image
                src={personalDetails.signature.url}
                style={styles.signature}
                cache={false}
              />
            ) : (
              <Text style={styles.value}>Not Attached</Text>
            )}
          </View>
        </View>
      </View>
    </Page>
  </>
);

export default function PrintApplication() {
  const [personalDetails, setPersonalDetails] = useState(null);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [enclosures, setEnclosures] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [declaration, setDeclaration] = useState({
    place: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [paymentForm, setPaymentForm] = useState({
    transaction_id: '',
    transaction_date: '',
    issued_bank: '',
    amount: '',
    status: ''
  });

  const handleDeclarationChange = (e) => {
    const { name, value } = e.target;
    setDeclaration(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/update`,
        paymentForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      if (response.data.success) {
        setPayment(response.data);
        toast.success('Payment details updated successfully');
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
      toast.error('Failed to update payment details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching personal and academic details...');
        
        // Get user data first
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/current-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('User data:', userResponse.data);
        setApplicationNumber(userResponse.data.user.usernameid);

        // Fetch personal details
        const personalResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/personal/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Personal details response:', personalResponse.data);
        setPersonalDetails(personalResponse.data);

        // Fetch academic details
        const academicResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/academic/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Academic details response:', academicResponse.data);
        setAcademicDetails(academicResponse.data);

        // Fetch enclosures
        const enclosuresResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/enclosures/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Enclosures response:', enclosuresResponse.data);
        setEnclosures(enclosuresResponse.data);
        // Set declaration data from enclosures
        if (enclosuresResponse.data?.enclosure?.declaration) {
          setDeclaration(enclosuresResponse.data.enclosure.declaration);
        }

        // Fetch payment details
        const paymentResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payment/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Payment details response:', paymentResponse.data);
        setPayment(paymentResponse.data);
        if (paymentResponse.data?.data) {
          setPaymentForm({
            transaction_id: paymentResponse.data.data.transaction_id || '',
            transaction_date: paymentResponse.data.data.transaction_date || '',
            issued_bank: paymentResponse.data.data.issued_bank || '',
            amount: paymentResponse.data.data.amount || '',
            status: paymentResponse.data.data.status || ''
          });
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Failed to fetch application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      console.log('Starting PDF generation process...');
      console.log('Payment data:', payment);
      
      // Create a new PDF document
      console.log('Creating new PDF document...');
      const mergedPdf = await PDFDocument.create();

      // Generate the application form PDF
      console.log('Generating application form PDF...');
      try {
        const pdfBlob = await pdf(
          <Document>
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
              enclosures={enclosures}
              payment={payment}
              declaration={declaration}
            />
          </Document>
        ).toBlob();
        
        console.log('Application form PDF generated successfully');
        
        // Load the application form PDF
        console.log('Loading application form PDF...');
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const applicationFormDoc = await PDFDocument.load(arrayBuffer);
        console.log('Application form PDF loaded successfully');
        
        // Copy all pages from the application form
        const applicationPages = await mergedPdf.copyPages(applicationFormDoc, applicationFormDoc.getPageIndices());
        applicationPages.forEach(page => mergedPdf.addPage(page));
        console.log(`Added ${applicationPages.length} pages from application form`);

        // Helper function to ensure HTTPS URLs and proper Cloudinary raw format
        const ensureHttps = (url) => {
          if (!url) return null;
          console.log('Original URL:', url);
          
          // Handle nested URL objects
          if (typeof url === 'object' && url.url) {
            url = url.url;
          }
          
          // Convert to raw format if it's a Cloudinary URL
          if (url.includes('cloudinary.com')) {
            // Check if this is a photo or signature URL (they should keep the /image/ path)
            if (url.includes('/image/') && (url.includes('photo') || url.includes('signature'))) {
              console.log('Keeping image format for photo/signature:', url);
              return url;
            }
            
            // For PDFs and other documents, remove /image/ and ensure raw format
            let processedUrl = url.replace('/image/', '/');
            
            // For other documents, ensure raw format
            if (!processedUrl.includes('/raw/upload/')) {
              processedUrl = processedUrl.replace('/upload/', '/raw/upload/');
            }
            console.log('Processed URL for document:', processedUrl);
            return processedUrl;
          }
          
          if (url.startsWith('http:')) {
            const httpsUrl = url.replace('http:', 'https:');
            console.log('Converted to HTTPS:', httpsUrl);
            return httpsUrl;
          }
          
          console.log('Returning original URL:', url);
          return url;
        };

        // Merge all documents
        const documentsToMerge = [
          // Personal documents - only demand draft
          ...(personalDetails?.dd_url ? [{
            url: ensureHttps(personalDetails.dd_url),
            type: 'demand-draft',
            contentType: 'application/pdf'
          }] : []),
          
          // Qualification documents
          ...((academicDetails?.qualifications || []).flatMap(qual => 
            qual.document_url ? [{
              url: ensureHttps(qual.document_url),
              type: `qualification-${qual.standard}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Experience documents
          ...((academicDetails?.experience || []).flatMap(exp => 
            exp.document_url ? [{
              url: ensureHttps(exp.document_url),
              type: `experience-${exp.organisation}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Publication documents
          ...((academicDetails?.publications || []).flatMap(pub => 
            pub.document_url ? [{
              url: ensureHttps(pub.document_url),
              type: `publication-${pub.paper_title}`,
              contentType: 'application/pdf'
            }] : []
          ) || [])
        ].filter(doc => doc.url); // Filter out any documents with null URLs

        // Process each document sequentially
        for (const doc of documentsToMerge) {
          if (doc.url) {
            try {
              console.log(`Processing document for ${doc.type}...`);
              console.log(`Document URL: ${doc.url}`);
              
              // Use the same approach as preview - create an object element
              const response = await fetch(doc.url, {
                method: 'GET',
                headers: {
                  'Accept': 'application/pdf'
                }
              });

              if (!response.ok) {
                console.error(`Failed to fetch document: ${response.status}`, response.statusText);
                throw new Error(`Failed to fetch document: ${response.status}`);
              }

              const blob = await response.blob();
              console.log(`Successfully fetched blob for ${doc.type}, size: ${blob.size}`);
              
              const arrayBuffer = await blob.arrayBuffer();
              console.log(`Successfully converted blob to arrayBuffer for ${doc.type}`);
              
              if (doc.contentType === 'application/pdf') {
                const docPdf = await PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
                console.log(`Added ${pages.length} pages from ${doc.type} document`);
              }
            } catch (error) {
              console.error(`Error processing document for ${doc.type}:`, error);
              // Add a placeholder page with error message
              const errorPage = mergedPdf.addPage();
              errorPage.drawText(`Error loading ${doc.type} document: ${error.message}`, {
                    x: 50,
                y: errorPage.getHeight() / 2,
                    size: 12,
                    color: rgb(1, 0, 0),
                  });
              toast.error(`Failed to add ${doc.type} document to PDF: ${error.message}`);
            }
          }
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const finalBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(finalBlob);
        setMergedPdfUrl(url);
        setShowPDF(true);
        toast.success('PDF generated successfully!');
      } catch (error) {
        console.error('Error in application form generation:', error);
        throw new Error(`Failed to generate application form: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in PDF generation process:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDDUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for Demand Draft');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal/upload-demand-draft`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setPersonalDetails(prev => ({
          ...prev,
          dd_url: response.data.url
        }));
        toast.success('Demand draft uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading demand draft:', error);
      toast.error(error.response?.data?.message || 'Failed to upload demand draft');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showPDF) {
    return (
      <div className="h-screen">
        {mergedPdfUrl ? (
          <iframe
            src={mergedPdfUrl}
            className="w-full h-full"
            title="Complete Application PDF"
          />
        ) : (
          <PDFViewer className="w-full h-full">
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
              enclosures={enclosures}
              payment={payment}
              declaration={declaration}
            />
          </PDFViewer>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Print Application</h1>
        <Button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Printer className="h-4 w-4" />
          Generate Complete Application
        </Button>
      </div>

      {/* Important Note */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Important:</span> After Completion, Take a printout of the application form and send the hard copy via Speed Post to the following address:
              <br />
              <br />
              <span className="font-medium">Address: The Office of Associate Dean (R&C)
              NIT Nagaland, Chumukedima, Nagaland - 797103</span>
              <br />
              
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Application Number */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">Application Number</h2>
          <p className="text-lg font-mono">{applicationNumber}</p>
        </div>

        {/* Personal Details */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{personalDetails.first_name} {personalDetails.last_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-medium">{personalDetails.date_of_birth ? new Date(personalDetails.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{personalDetails.gender}</p>
              </div>
              <div>
                <p className="text-gray-600">Nationality</p>
                <p className="font-medium">{personalDetails.nationality}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{personalDetails.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Religion</p>
                <p className="font-medium">{personalDetails.religion}</p>
              </div>
              <div>
                <p className="text-gray-600">Father's Name</p>
                <p className="font-medium">{personalDetails.father_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Mother's Name</p>
                <p className="font-medium">{personalDetails.mother_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Marital Status</p>
                <p className="font-medium">{personalDetails.marital_status}</p>
              </div>
              {personalDetails.marital_status !== 'Single' && (
                <div>
                  <p className="text-gray-600">Spouse Name</p>
                  <p className="font-medium">{personalDetails.spouse_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{personalDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{personalDetails.phone}</p>
              </div>
              {personalDetails.alternate_phone && (
                <div>
                  <p className="text-gray-600">Alternate Phone</p>
                  <p className="font-medium">{personalDetails.alternate_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Communication Address */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Current Address</h2>
            <div>
              <p className="font-medium">{personalDetails?.current_address?.street || 'Not specified'}</p>
              {personalDetails?.current_address?.line2 && (
                <p className="font-medium">{personalDetails.current_address.line2}</p>
              )}
              {personalDetails?.current_address?.line3 && (
                <p className="font-medium">{personalDetails.current_address.line3}</p>
              )}
              <p className="font-medium">
                {personalDetails?.current_address?.city || 'Not specified'}, {personalDetails?.current_address?.state || 'Not specified'} - {personalDetails?.current_address?.pincode || 'Not specified'}
              </p>
            </div>
          </div>
        )}

        {/* Permanent Address */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Permanent Address</h2>
            <div>
              <p className="font-medium">{personalDetails?.permanent_address?.street || 'Not specified'}</p>
              {personalDetails?.permanent_address?.line2 && (
                <p className="font-medium">{personalDetails.permanent_address.line2}</p>
              )}
              {personalDetails?.permanent_address?.line3 && (
                <p className="font-medium">{personalDetails.permanent_address.line3}</p>
              )}
              <p className="font-medium">
                {personalDetails?.permanent_address?.city || 'Not specified'}, {personalDetails?.permanent_address?.state || 'Not specified'} - {personalDetails?.permanent_address?.pincode || 'Not specified'}
              </p>
            </div>
          </div>
        )}

        {/* Academic Details */}
        {academicDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Academic Details</h2>
            
            {/* Academic Qualifications Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Qualifications</h3>
              {(academicDetails?.qualifications || []).map((qual, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                  <p className="text-gray-600">{qual.university}</p>
                  <p className="text-gray-600">Year: {qual.year_of_completion}</p>
                  <p className="text-gray-600">Marks: {qual.marks_obtained} {qual.marks_type}</p>
                  {qual.branch && <p className="text-gray-600">Branch: {qual.branch}</p>}
                  <p className="text-gray-600">Program Duration: {qual.program_duration_months} months</p>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              {(academicDetails?.experience || []).map((exp, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{exp.type}</p>
                  <p className="text-gray-600">Organization: {exp.organisation}</p>
                  <p className="text-gray-600">Place: {exp.place}</p>
                  <p className="text-gray-600">Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</p>
                  <p className="text-gray-600">Designation: {exp.designation}</p>
                  <p className="text-gray-600">Monthly Compensation: {exp.monthly_compensation}</p>
                  <p className="text-gray-600">Nature of Work: {exp.nature_of_work}</p>
                </div>
              ))}
            </div>

            {/* Publications */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Publications</h3>
              {(academicDetails?.publications || []).map((pub, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{pub.type}</p>
                  <p className="text-gray-600">Title: {pub.paper_title}</p>
                  <p className="text-gray-600">Affiliation: {pub.affiliation}</p>
                  <p className="text-gray-600">Year: {pub.acceptance_year}</p>
                </div>
              ))}
            </div>

            {/* Mode of PhD Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Mode of PhD</h3>
              <div className="border border-gray-200 rounded p-4">
                <p className="text-gray-700">
                  {personalDetails?.mode_of_phd || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Examination Results Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Examination Results</h3>
              <div className="border border-gray-200 rounded p-4">
                {/* Bachelor's Degree */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Bachelor's Degree</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Aggregate/CGPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.cgpa || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.class || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">% of Marks/GPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.aggregate?.percentage || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Semester-wise Marks</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2">Semester I</th>
                            <th className="border p-2">Semester II</th>
                            <th className="border p-2">Semester III</th>
                            <th className="border p-2">Semester IV</th>
                            <th className="border p-2">Semester V</th>
                            <th className="border p-2">Semester VI</th>
                            <th className="border p-2">Semester VII</th>
                            <th className="border p-2">Semester VIII</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.I?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.II?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.III?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.IV?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.V?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VI?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VII?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.examination_results?.ug?.semesters?.VIII?.marks || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Master's Degree */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Master's Degree</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Aggregate/CGPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.cgpa || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.class || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">% of Marks/GPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.aggregate?.percentage || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Semester-wise Marks</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2">Semester I</th>
                            <th className="border p-2">Semester II</th>
                            <th className="border p-2">Semester III</th>
                            <th className="border p-2">Semester IV</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.I?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.II?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.III?.marks || '-'}</td>
                            <td className="border p-2">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.examination_results?.pg?.semesters?.IV?.marks || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Other Degree/Diploma */}
                <div>
                  <h4 className="font-medium mb-2">Other Degree/Diploma</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Degree Name</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.degree_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Aggregate/CGPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.aggregate?.cgpa || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.aggregate?.class || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">% of Marks/GPA</p>
                      <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'Other')?.examination_results?.other?.aggregate?.percentage || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Qualifications Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Additional Qualifications</h3>
              <div className="border border-gray-200 rounded p-4">
                {/* GATE Details */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">GATE Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'GATE')?.score || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Qualifying Year</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'GATE')?.qualifying_year || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Exam</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'GATE')?.date_of_exam ? new Date(academicDetails.additional_qualifications.find(q => q.exam_type === 'GATE').date_of_exam).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* NET/CSIR/UGC/JRF/Lectureship/NBHM/Others */}
                <div>
                  <h4 className="font-medium mb-2">NET/CSIR/UGC/JRF/Lectureship/NBHM/Others</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.score || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Qualifying Year</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.qualifying_year || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Exam</p>
                      <p className="text-gray-700">{academicDetails?.additional_qualifications?.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other')?.date_of_exam ? new Date(academicDetails.additional_qualifications.find(q => q.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other').date_of_exam).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Titles Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Project Titles</h3>
              <div className="border border-gray-200 rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">UG Project Title</p>
                    <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'UG')?.project_title || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PG Project Title</p>
                    <p className="text-gray-700">{academicDetails?.qualifications?.find(q => q.standard === 'PG')?.project_title || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interested Area of Research Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Interested Area of Research</h3>
              <div className="border border-gray-200 rounded p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-gray-700">{academicDetails?.research_interest?.branch || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Specialization/Area of Research</p>
                    <p className="text-gray-700">{academicDetails?.research_interest?.area || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          
          {/* Academic Documents */}
          <div>
            <h3 className="text-lg font-medium mb-2">Academic Documents</h3>
            <div className="space-y-4">
              {/* Qualification Documents */}
              {(academicDetails?.qualifications || []).map((qual, index) => (
                qual.document_url && (
                  <div key={`qual-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                      <a 
                        href={ensureHttps(qual.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <object
                        data={`${ensureHttps(qual.document_url)}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <p className="text-sm text-gray-600">Unable to display PDF file. <a href={ensureHttps(qual.document_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                      </object>
                    </div>
                  </div>
                )
              ))}

              {/* Experience Documents */}
              {(academicDetails?.experience || []).map((exp, index) => (
                exp.experience_certificate_url && (
                  <div key={`exp-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Experience at {exp.organisation}</p>
                      <a 
                        href={ensureHttps(exp.experience_certificate_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <object
                        data={`${ensureHttps(exp.experience_certificate_url)}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <p className="text-sm text-gray-600">Unable to display PDF file. <a href={ensureHttps(exp.experience_certificate_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                      </object>
                    </div>
                  </div>
                )
              ))}

              {/* Publication Documents */}
              {(academicDetails?.publications || []).map((pub, index) => (
                pub.document_url && (
                  <div key={`pub-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{pub.paper_title}</p>
                      <a 
                        href={ensureHttps(pub.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <object
                        data={`${ensureHttps(pub.document_url)}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <p className="text-sm text-gray-600">Unable to display PDF file. <a href={ensureHttps(pub.document_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                      </object>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="border rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">DECLARATION</h2>
          <p className="mb-6">
            I hereby declare that I have carefully read the instructions and particulars relevant to this admission and that the entries made in this application form are correct to the best of my knowledge and belief.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="place">Place:</Label>
              <Input
                id="place"
                name="place"
                value={declaration.place}
                onChange={handleDeclarationChange}
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
                value={declaration.date}
                onChange={handleDeclarationChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <form onSubmit={handlePaymentUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  name="transaction_id"
                  value={paymentForm.transaction_id}
                  onChange={handlePaymentChange}
                  placeholder="Enter transaction ID"
                />
              </div>
              <div>
                <Label htmlFor="transaction_date">Transaction Date</Label>
                <Input
                  id="transaction_date"
                  name="transaction_date"
                  type="date"
                  value={paymentForm.transaction_date}
                  onChange={handlePaymentChange}
                />
              </div>
              <div>
                <Label htmlFor="issued_bank">Issued Bank</Label>
                <Input
                  id="issued_bank"
                  name="issued_bank"
                  value={paymentForm.issued_bank}
                  onChange={handlePaymentChange}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  name="status"
                  value={paymentForm.status}
                  onChange={handlePaymentChange}
                  placeholder="Enter status"
                />
              </div>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Payment Details
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 