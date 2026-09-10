import mongoose from 'mongoose';
import { IAbout } from './about.interface';

export const aboutSchema = new mongoose.Schema<IAbout>(
  {
    aboutUs: {
      type: String,
      required: [true, 'About Us content is required'],
      maxlength: [50000, 'About Us cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

const About = mongoose.model<IAbout>('about', aboutSchema);
export default About;
