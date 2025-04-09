const Enclosure = require("../models/Enclosures");
const { uploadToCloudinary } = require("../utils/cloudinary");

const createEnclosure = async (req, res) => {
  try {
    const { enclosures, additional_info, declaration } = req.body;
    const userId = req.user._id;

    // Check if enclosure already exists
    let enclosure = await Enclosure.findOne({ user: userId });
    
    if (enclosure) {
      // Update existing enclosure
      enclosure.enclosures = enclosures;
      enclosure.additional_info = additional_info;
      enclosure.declaration = declaration;
      await enclosure.save();
      
      return res.status(200).json({
        success: true,
        message: "Enclosures updated successfully",
        enclosure
      });
    }

    // Create new enclosure
    enclosure = new Enclosure({
      user: userId,
      enclosures,
      additional_info,
      declaration
    });

    await enclosure.save();
    
    return res.status(201).json({
      success: true,
      message: "Enclosures created successfully",
      enclosure
    });
  } catch (error) {
    console.error('Error in createEnclosure:', error);
    return res.status(500).json({
      success: false,
      message: "Error saving enclosures",
      error: error.message
    });
  }
};

const getEnclosure = async (req, res) => {
  try {
    const userId = req.user._id;
    const enclosure = await Enclosure.findOne({ user: userId });

    if (!enclosure) {
      return res.status(200).json({
        success: true,
        enclosure: {
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
            date: new Date()
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      enclosure
    });
  } catch (error) {
    console.error('Error in getEnclosure:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching enclosures",
      error: error.message
    });
  }
};

const uploadSignature = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await uploadToCloudinary(file);
    const userId = req.user._id;

    const enclosure = await Enclosure.findOneAndUpdate(
      { user: userId },
      { "declaration.signature_url": uploadResult.secure_url },
      { new: true }
    );

    if (!enclosure) {
      return res.status(404).json({ message: "Enclosure not found" });
    }

    res.json(enclosure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEnclosure,
  getEnclosure,
  uploadSignature
}; 