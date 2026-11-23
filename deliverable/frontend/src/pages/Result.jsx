import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Result.css';

const Result = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axiosInstance.get('/student/results');
                setResults(response.data.data || []);
            } catch (err) {
                console.error('Error fetching results:', err);
                setError('Could not load your results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    return (
        <div className="result-container">
            <h1>Your Results</h1>

            {loading && <p>Loading results...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && results.length === 0 && (
                <p>No results have been published for you yet.</p>
            )}

            {results.length > 0 && (
                <ul className="result-list">
                    {results.map((result) => (
                        <li key={result._id} className="result-card">
                            <h2>{result.companyName}</h2>
                            <p><strong>Result:</strong> {result.result}</p>
                            <p><strong>Cleared Round:</strong> {result.clearedRound}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Result;
