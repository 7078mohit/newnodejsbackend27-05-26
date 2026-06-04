import mongoose from 'mongoose';
import KundaliForm from '../models/KundaliForm.js';


// Create Kundali Form
export const createKundaliForm = async (req, res) => {
  try {

    const {
      name,
      phoneNumber,
      dateOfBirth,
      gender,
      location
    } = req.body;

    // All Fields Required Validation
    if (
      !name ||
      !phoneNumber ||
      !dateOfBirth ||
      !gender ||
      !location ||
      !location.country ||
      !location.state ||
      !location.cityOrVillage ||
      !location.birthHour
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }


    // Duplicate Check
    const existingUser = await KundaliForm.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already submitted form'
      });
    }

    // Create Form
    const form = await KundaliForm.create({
      name,
      phoneNumber,
      dateOfBirth,
      gender,
      location
    });

    return res.status(201).json({
      success: true,
      message: 'Kundali form submitted successfully',
      data: form
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });

  }
};



// Get All Kundali Forms
export const getAllKundaliForms = async (req, res) => {
  try {

    const forms = await KundaliForm.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'All Kundali forms fetched successfully',
      count: forms.length,
      data: forms
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: err.message
    });

  }
};


// Get Single Kundali Form By ID
export const getKundaliFormById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID'
      });
    }

    const form = await KundaliForm.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kundali form fetched successfully',
      data: form
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: err.message
    });

  }
};


// Update Kundali Form
export const updateKundaliForm = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID'
      });
    }

    const {
      name,
      phoneNumber,
      dateOfBirth,
      gender,
      location
    } = req.body;

    const updatedForm = await KundaliForm.findByIdAndUpdate(
      id,
      {
        name,
        phoneNumber,
        dateOfBirth,
        gender,
        location
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kundali form updated successfully',
      data: updatedForm
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Error updating form',
      error: err.message
    });

  }
};


// Delete Kundali Form
export const deleteKundaliForm = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID'
      });
    }

    const deletedForm = await KundaliForm.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kundali form deleted successfully',
      data: deletedForm
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Error deleting form',
      error: err.message
    });

  }
};