import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/FilledCompanies.css';

const FilledCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppliedCompanies = async () => {
            try {
                const response = await axiosInstance.get('/student/applied-companies');
                setCompanies(response.data.companies || []);
            } catch (err) {
                console.error('Error fetching applied companies:', err);
                setError('Failed to load applied companies. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchAppliedCompanies();
    }, []);

    if (loading) return <p>Loading applied companies...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="filled-companies-container">
            <h1>Applied Companies</h1>
            {companies.length === 0 ? (
                <p>You haven't marked any company as applied yet. Open "Upcoming Companies" to do that.</p>
            ) : (
                <ul className="company-list">
                    {companies.map((company) => (
                        <li key={company._id} className="company-card">
                            <h2>{company.name}</h2>
                            <p><strong>Department:</strong> {company.department}</p>
                            <p><strong>Application Deadline:</strong> {new Date(company.applicationDeadline).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FilledCompanies;
