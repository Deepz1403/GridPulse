import bcrypt from 'bcrypt';
import Attendant from '../models/attendant.js';

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const attendant = await Attendant.findOne({ email });
  
      if (!attendant) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, attendant.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      req.session.attendant = {
        id: attendant._id,
        email: attendant.email,
        substation: attendant.substation,
        role: attendant.role
      };
  
      res.status(200).json({
        message: 'Login successful',
        attendant: {
          id: attendant._id,
          name: attendant.name,
          email: attendant.email,
          substation: attendant.substation
        }
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
export const logoutUser = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Logout failed", error: err });
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "Logout successful" });
        });
    } else {
        return res.status(400).json({ message: "No active session found" });
    }
  };