import nodemailer from 'nodemailer';
import Contact from '../models/Contact.js';

export const addContact = async (req, res) => {
  try {
    const { name, email, mobile, gender, dob_time, place_of_birth, query } = req.body;

    const normalizedGender = gender
      ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
      : gender;

    if (!name || !email || !mobile || !normalizedGender || !dob_time || !place_of_birth || !query) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contact = await Contact.create({ name, email, mobile, gender: normalizedGender, dob_time, place_of_birth, query });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"Kalp Jyotish Contact Form" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: 'New Contact Form Submission',
          html: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mobile:</strong> ${mobile}</p><p><strong>Gender:</strong> ${normalizedGender}</p><p><strong>DOB + Time:</strong> ${dob_time}</p><p><strong>Place of Birth:</strong> ${place_of_birth}</p><p><strong>Query:</strong> ${query}</p>`,
        });
      } catch (mailErr) {
        console.warn('Email sending failed (non-fatal):', mailErr.message);
      }
    }

    return res.status(201).json({ success: true, message: 'Form submitted successfully', data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
