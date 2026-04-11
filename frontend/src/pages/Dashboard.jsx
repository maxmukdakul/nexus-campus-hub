import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
    const { user, logout } = useAuth();
    
    // UI State
    const [activeTab, setActiveTab] = useState('hardware'); // 'hardware' or 'digital'
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Data State
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [materials, setMaterials] = useState([]);

    // File Upload State
    const [fileTitle, setFileTitle] = useState('');
    const [fileDesc, setFileDesc] = useState('');
    const [fileTags, setFileTags] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const isStudent = user?.role === 'STUDENT';
    const isStaff = user?.role === 'STAFF';
    const isAdmin = user?.role === 'ADMIN' || !user?.role;

    useEffect(() => {
        fetchData();
    }, [searchQuery, activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'hardware') {
                const eqRes = await api.get(`equipment/?search=${searchQuery}`);
                setEquipment(eqRes.data.results || eqRes.data || []);
                const bkRes = await api.get('bookings/');
                setBookings(bkRes.data.results || bkRes.data || []);
            } else {
                const matRes = await api.get(`materials/?search=${searchQuery}`);
                setMaterials(matRes.data.results || matRes.data || []);
            }
        } catch (err) {
            setError("Could not communicate with the database.");
        }
    };

    // --- HARDWARE BOOKING LOGIC ---
    const handleBook = async (equipmentId) => {
        setError(''); setSuccessMessage('');
        try {
            const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(9, 0, 0, 0);
            const end = new Date(start); end.setHours(11, 0, 0, 0);
            await api.post('bookings/', { equipment: equipmentId, start_time: start.toISOString(), end_time: end.toISOString() });
            fetchData();
            setSuccessMessage("Booking requested successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.conflict?.[0] || "Failed to create booking.");
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        await api.patch(`bookings/${bookingId}/`, { status: newStatus });
        fetchData();
    };

    // --- DIGITAL FILE LOGIC ---
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) { setError("Please select a file."); return; }

        const formData = new FormData();
        formData.append('title', fileTitle);
        formData.append('description', fileDesc);
        formData.append('tags', fileTags);
        formData.append('file', selectedFile);

        try {
            await api.post('materials/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFileTitle(''); setFileDesc(''); setFileTags(''); setSelectedFile(null);
            fileInputRef.current.value = "";
            fetchData();
            setSuccessMessage("File uploaded for peer-review!");
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError("Upload failed. Please try again.");
        }
    };

    const handleApproveMaterial = async (id, isApproved) => {
        await api.patch(`materials/${id}/`, { is_approved: isApproved });
        fetchData();
    };

    // --- SHARED UI STYLES ---
    const tabStyle = (isActive) => ({
        padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent', color: isActive ? '#0f172a' : '#64748b', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none'
    });

    return (
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '32px' }}>Nexus Resource Hub</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        Role: <strong style={{ color: '#2563eb' }}>{user?.role || 'SYSTEM ADMIN'}</strong> | User: <strong>{user?.username}</strong>
                    </p>
                </div>
                <button onClick={logout} className="danger">Logout</button>
            </header>

            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}
            {successMessage && <div style={{ background: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>{successMessage}</div>}

            {/* --- NAVIGATION TABS --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
                <button onClick={() => setActiveTab('hardware')} style={tabStyle(activeTab === 'hardware')}>📷 Hardware & Equipment</button>
                <button onClick={() => setActiveTab('digital')} style={tabStyle(activeTab === 'digital')}>📚 Digital Study Materials</button>
            </div>

            {/* Search Bar (Shared) */}
            <div style={{ marginBottom: '30px' }}>
                <input type="text" placeholder={`Search ${activeTab === 'hardware' ? 'equipment' : 'documents'}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '12px 20px', width: '100%', maxWidth: '400px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            {/* ============================== */}
            {/* TAB 1: HARDWARE BOOKING SYSTEM */}
            {/* ============================== */}
            {activeTab === 'hardware' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '50px' }}>
                        {equipment.map(item => (
                            <div key={item.id} className="card" style={{ padding: '24px', borderRadius: '12px', borderTop: '4px solid #0f172a', background: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: item.is_available ? '#d1fae5' : '#fee2e2', color: item.is_available ? '#065f46' : '#991b1b' }}>{item.is_available ? 'AVAILABLE' : 'IN USE'}</span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>{item.description}</p>
                                {isStudent && (
                                    <button onClick={() => handleBook(item.id)} disabled={!item.is_available} className="success" style={{ marginTop: '15px', width: '100%' }}>Book Equipment</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <h2 style={{ color: '#334155', marginBottom: '20px' }}>Active Reservations</h2>
                    <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ background: '#0f172a', color: 'white' }}>
                            <tr><th style={{padding: '12px'}}>Item</th><th style={{padding: '12px'}}>Student</th><th style={{padding: '12px'}}>Status</th>{(isAdmin || isStaff) && <th style={{padding: '12px'}}>Action</th>}</tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{padding: '12px', fontWeight: 'bold'}}>{b.equipment_name}</td>
                                    <td style={{padding: '12px'}}>{b.student_name}</td>
                                    <td style={{padding: '12px'}}>{b.status}</td>
                                    {(isAdmin || isStaff) && (
                                        <td style={{padding: '12px', display: 'flex', gap: '5px'}}>
                                            <button onClick={() => handleStatusUpdate(b.id, 'APPROVED')} style={{ background: '#10b981' }}>Approve</button>
                                            <button onClick={() => handleStatusUpdate(b.id, 'REJECTED')} style={{ background: '#ef4444' }}>Reject</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {/* ============================== */}
            {/* TAB 2: DIGITAL RESOURCE LIBRARY */}
            {/* ============================== */}
            {activeTab === 'digital' && (
                <>
                    {/* Upload Form */}
                    <div className="card" style={{ background: '#f8fafc', padding: '24px', marginBottom: '40px', border: '1px dashed #cbd5e1' }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>📤 Upload Study Material (Requires Peer Review)</h3>
                        <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="text" placeholder="Document Title" value={fileTitle} onChange={e => setFileTitle(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
                                <input type="text" placeholder="Tags (e.g. Physics, Notes)" value={fileTags} onChange={e => setFileTags(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
                            </div>
                            <input type="text" placeholder="Short Description" value={fileDesc} onChange={e => setFileDesc(e.target.value)} required style={{ padding: '10px', borderRadius: '6px' }} />
                            <input type="file" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} required style={{ padding: '10px', background: 'white', borderRadius: '6px' }} />
                            <button type="submit" className="success" style={{ alignSelf: 'flex-start' }}>Submit for Review</button>
                        </form>
                    </div>

                    {/* File Library */}
                    <h2 style={{ color: '#334155', marginBottom: '20px' }}>Study Materials Library</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {materials.map(mat => (
                            <div key={mat.id} className="card" style={{ padding: '20px', background: 'white', borderLeft: mat.is_approved ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{mat.title}</h3>
                                    {!mat.is_approved && <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>PENDING REVIEW</span>}
                                </div>
                                <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', margin: '0 0 10px 0' }}>Tags: {mat.tags}</p>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>{mat.description}</p>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Uploaded by: {mat.uploader_name}</p>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    {mat.is_approved && (
                                        <a href={mat.file} target="_blank" rel="noopener noreferrer" style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', textAlign: 'center', flex: 1, fontSize: '14px', fontWeight: 'bold' }}>
                                            Download PDF
                                        </a>
                                    )}
                                    {/* Staff Review Controls */}
                                    {(isAdmin || isStaff) && !mat.is_approved && (
                                        <button onClick={() => handleApproveMaterial(mat.id, true)} className="success" style={{ flex: 1 }}>Approve Post</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}