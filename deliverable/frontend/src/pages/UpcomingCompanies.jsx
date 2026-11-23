import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/UpcomingCompanies.css';

const UpcomingCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axiosInstance.get('/student/upcoming-companies');
                setCompanies(response.data.companies || []);
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError('Failed to load upcoming companies. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    // Called after the student has filled the Google Form
    const markApplied = async (companyId) => {
        try {
            await axiosInstance.post(`/student/apply/${companyId}`);
            setCompanies((prev) => prev.map((c) => (c._id === companyId ? { ...c, applied: true } : c)));
            setMessage('');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Could not mark as applied.');
        }
    };

    if (loading) return <p>Loading companies...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="upcoming-companies-container">
            <h1>Upcoming Companies</h1>
            {message && <p className="error">{message}</p>}
            {companies.length === 0 ? (
                <p>No upcoming companies at the moment.</p>
            ) : (
                <ul className="company-list">
                    {companies.map((company) => (
                        <li key={company._id} className="company-card">
                            <h2>{company.name}</h2>
                            <p><strong>Eligibility:</strong> {company.eligibility}</p>
                            <p><strong>Description:</strong> {company.description || 'No description available'}</p>
                            <p><strong>Application Deadline:</strong> {new Date(company.applicationDeadline).toLocaleDateString()}</p>
                            <p>
                                <strong>Google Form:</strong>{' '}
                                <a href={company.googleFormLink} target="_blank" rel="noopener noreferrer">
                                    Apply Here
                                </a>
                            </p>
                            {company.applied ? (
                                <p>✅ Marked as applied</p>
                            ) : (
                                <button onClick={() => markApplied(company._id)}>I have applied</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UpcomingCompanies;
