import React, { useState, useEffect } from 'react';
import axiosInstance, { API_BASE_URL } from '../api/axiosInstance';
import '../styles/LearningMaterial.css';

const LearningMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await axiosInstance.get('/student/learningmaterial');
                setMaterials(response.data.data || []);
            } catch (err) {
                console.error('Error fetching learning materials:', err);
                setError('❌ Could not fetch learning materials. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    return (
        <div className="learning-materials-container">
            <h1>📘 Learning Materials</h1>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p className="loading-message">Loading...</p>
            ) : (
                <ul className="material-list">
                    {materials.length === 0 ? (
                        <p>No learning materials available.</p>
                    ) : (
                        materials.map((material) => (
                            <li key={material._id} className="material-card">
                                <h2>{material.subject}</h2>
                                <p><strong>Uploaded:</strong> {new Date(material.uploadedAt).toLocaleDateString()}</p>
                                <a
                                    href={`${API_BASE_URL}${material.pdfUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="material-link"
                                >
                                    📄 View PDF
                                </a>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default LearningMaterials;
