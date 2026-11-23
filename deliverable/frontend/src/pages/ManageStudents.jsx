import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/AdminStyles.css';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // The axios instance attaches the admin token for /admin/... requests
                const response = await axiosInstance.get('/admin/students');
                setStudents(response.data.data || []);
            } catch {
                setError('Failed to fetch students.');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleDelete = async (student) => {
        if (!window.confirm(`Delete ${student.fullName || student.email}? Their tests, results and resume will be deleted too.`)) {
            return;
        }
        try {
            await axiosInstance.delete(`/admin/students/${student._id}`);
            setStudents((prev) => prev.filter((s) => s._id !== student._id));
        } catch {
            alert('Failed to delete student.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="admin-page">
            <h1>Manage Students</h1>
            {students.length === 0 ? (
                <p>No students have registered yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Enrollment No.</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td>{student.fullName || '—'}</td>
                                <td>{student.email}</td>
                                <td>{student.enrollmentNumber || '—'}</td>
                                <td>{student.department}</td>
                                <td>
                                    <button onClick={() => handleDelete(student)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageStudents;
