import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Tests.css';

const TestDetails = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // The server knows who is logged in from the token, so no enrollment number is needed.
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await axiosInstance.get('/student/tests');
                setTests(response.data.data || []);
            } catch (err) {
                console.error('Error fetching tests:', err);
                setError('Could not load your tests. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    return (
        <div className="test-details-container">
            <h1>Your Tests</h1>

            {loading && <p className="loading-message">Loading tests...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && tests.length === 0 && (
                <p className="no-tests-message">No tests have been assigned to you yet.</p>
            )}

            {tests.length > 0 && (
                <ul className="test-list">
                    {tests.map((test) => (
                        <li key={test._id} className="test-card">
                            <h2>{test.companyName}</h2>
                            <p><strong>Test Date:</strong> {new Date(test.testDate).toLocaleString()}</p>
                            <p><strong>Location:</strong> {test.location || 'Online'}</p>
                            <p><strong>Status:</strong> {test.status}</p>
                            <p><strong>Description:</strong> {test.description || 'No description available'}</p>
                            <p><strong>Test Link:</strong> <a href={test.testLink} target="_blank" rel="noopener noreferrer">Start Test</a></p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TestDetails;
