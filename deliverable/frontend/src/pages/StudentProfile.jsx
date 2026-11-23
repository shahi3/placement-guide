import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Profile.css';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/student/profile');
                setProfile(response.data.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile. Please log in again.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const uploadResume = async (e) => {
        e.preventDefault();
        if (!resumeFile) return;
        const formData = new FormData();
        formData.append('resume', resumeFile);
        try {
            await axiosInstance.post('/student/upload-resume', formData);
            setResumeMessage('✅ Resume uploaded.');
            setResumeFile(null);
            e.target.reset();
        } catch (err) {
            setResumeMessage(`❌ ${err.response?.data?.message || 'Upload failed.'}`);
        }
    };

    // The resume is private, so it is fetched with the token and opened from memory
    const viewResume = async () => {
        try {
            const response = await axiosInstance.get('/student/resume', { responseType: 'blob' });
            window.open(URL.createObjectURL(response.data), '_blank');
        } catch {
            setResumeMessage('❌ No resume uploaded yet.');
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="error">{error}</p>;

    return profile ? (
        <div className="profile-container">
            <h1>{profile.fullName || profile.email}</h1>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Course Year:</strong> {profile.courseYear}</p>
            <p><strong>10th Marks:</strong> {profile.marks10}%</p>
            <p><strong>12th Marks:</strong> {profile.marks12}%</p>
            <p><strong>Enrollment Number:</strong> {profile.enrollmentNumber}</p>
            <p><strong>Mobile Number:</strong> {profile.mobileNumber}</p>
            <p><strong>Department:</strong> {profile.department}</p>
            <p><strong>Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>

            <h2>Resume</h2>
            <form onSubmit={uploadResume}>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0] || null)}
                />
                <button type="submit" disabled={!resumeFile}>Upload (PDF/DOC/DOCX, max 5 MB)</button>
            </form>
            <button type="button" onClick={viewResume}>View my resume</button>
            {resumeMessage && <p>{resumeMessage}</p>}
        </div>
    ) : (
        <p>Profile not found.</p>
    );
};

export default StudentProfile;
