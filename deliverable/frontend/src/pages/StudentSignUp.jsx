import React, { useState } from 'react';
import '../styles/StudentSignUp.css';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StudentSignUp = () => {
    const [studentData, setStudentData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        courseYear: '',
        marks10: '',
        marks12: '',
        enrollmentNumber: '',
        mobileNumber: '',
        department: '',
        dateOfBirth: ''
    });
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData({ ...studentData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate password confirmation
        if (studentData.password !== studentData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        try {
            const response = await axiosInstance.post('/placementguide/register', {
                fullName: studentData.fullName,
                email: studentData.email,
                password: studentData.password,
                courseYear: studentData.courseYear,
                marks10: studentData.marks10,
                marks12: studentData.marks12,
                enrollmentNumber: studentData.enrollmentNumber,
                mobileNumber: studentData.mobileNumber,
                department: studentData.department,
                dateOfBirth: studentData.dateOfBirth
            });
            alert(response.data.message || 'Student Registered Successfully');
            setStudentData({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                courseYear: '',
                marks10: '',
                marks12: '',
                enrollmentNumber: '',
                mobileNumber: '',
                department: '',
                dateOfBirth: ''
            });
            navigate('/student-login'); // Redirect to the login page after successful sign-up
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <h1>Student Sign-Up</h1>
            <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={studentData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={studentData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        minLength={8}
                        value={studentData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={studentData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="courseYear">Course Year:</label>
                    <input
                        type="number"
                        id="courseYear"
                        name="courseYear"
                        value={studentData.courseYear}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="marks10">10th Marks (%):</label>
                    <input
                        type="number"
                        id="marks10"
                        name="marks10"
                        value={studentData.marks10}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="marks12">12th Marks (%):</label>
                    <input
                        type="number"
                        id="marks12"
                        name="marks12"
                        value={studentData.marks12}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="enrollmentNumber">Enrollment Number:</label>
                    <input
                        type="text"
                        id="enrollmentNumber"
                        name="enrollmentNumber"
                        value={studentData.enrollmentNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mobileNumber">Mobile Number:</label>
                    <input
                        type="text"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={studentData.mobileNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="department">Department:</label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={studentData.department}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth:</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={studentData.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="submit-button">Sign Up</button>
            </form>
        </div>
    );
};

export default StudentSignUp;
