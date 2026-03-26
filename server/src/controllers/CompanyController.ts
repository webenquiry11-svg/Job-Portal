import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await AuthModel.findById(id).select('-password -emailOtp -phoneOtp');
    if (!company || company.role !== 'employer') {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error: any) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: error.message || "Failed to fetch company profile" });
  }
};