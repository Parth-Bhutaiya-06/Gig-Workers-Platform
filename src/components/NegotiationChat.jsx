import { useState, useEffect } from "react";
import { getMessages, sendMessage, updateApplicationWage, updateApplicationStatus, submitReview } from "../services/api";

export default function NegotiationChat({ application, close, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [wage, setWage] = useState(application.negotiated_wage || application.job_details?.wages || 0);
    const [isFinalized, setIsFinalized] = useState(application.negotiated_wage != null);
    const [status, setStatus] = useState(application.status);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [showReview, setShowReview] = useState(false);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [application.id]);

    const fetchMessages = async () => {
        try {
            const data = await getMessages(application.id);
            // Sort by timestamp if not already
            setMessages(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching messages", err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await sendMessage(application.id, newMessage);
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    const handleWageUpdate = async () => {
        if (!window.confirm("Appointing Worker: This action will finalize the wage and APPOINT this worker. It cannot be undone. Are you sure?")) return;
        try {
            await updateApplicationWage(application.id, wage);
            alert(`Worker Appointed! Wage finalized at ₹${wage}`);
            setIsFinalized(true);
            setStatus('approved');
        } catch (err) {
            console.error("Error updating wage", err);
            alert("Failed to update wage. " + (err.response?.data?.detail || ""));
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to REJECT this application? This cannot be undone.")) return;
        try {
            await updateApplicationStatus(application.id, 'rejected');
            alert("Application Rejected.");
            setStatus('rejected');
            close();
        } catch (err) {
            alert("Failed to reject application.");
        }
    };

    const handleComplete = async () => {
        if (!window.confirm("Is the job fully completed? Proceed to rating.")) return;
        try {
            await updateApplicationStatus(application.id, 'completed');
            setStatus('completed');
            setShowReview(true); // Open Review Modal
        } catch (err) {
            alert("Failed to complete job.");
        }
    };

    const handleSubmitReview = async () => {
        try {
            const reviewData = {
                application: application.id,
                worker_rating: currentUser.role === 'poster' ? rating : null,
                poster_rating: currentUser.role === 'worker' ? rating : null, // Future proof
                worker_feedback: currentUser.role === 'poster' ? feedback : null,
                poster_feedback: currentUser.role === 'worker' ? feedback : null
            };

            // Note: Our serializer currently expects all fields or partial?
            // Let's refine the payload to match what the serializer likely expects or allows defaults
            // We'll send what we have. API backend might need to handle partials if Review model has fields that are required?
            // Models says null=True blank=True for ratings so we are good.

            await submitReview({
                application: application.id,
                worker_rating: rating,
                worker_feedback: feedback
            });

            alert("Job Completed & Review Submitted! Thank you.");
            close();
        } catch (err) {
            alert("Review submission failed: " + (err.response?.data?.detail || err.message));
        }
    };

    if (showReview) {
        return (
            <div className="modal-overlay active">
                <div className="modal-content review-modal" style={{ textAlign: 'center' }}>
                    <h2 className="modal-title">Rate the Worker</h2>
                    <div style={{ fontSize: '2rem', margin: '1rem 0', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} onClick={() => setRating(star)} style={{ color: star <= rating ? '#fbbf24' : '#e2e8f0' }}>★</span>
                        ))}
                    </div>
                    <div className="form-group">
                        <textarea
                            className="premium-input"
                            placeholder="Write a brief review about the worker's performance..."
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <button className="btn btn-primary btn-full" onClick={handleSubmitReview}>Submit Review</button>
                    <button className="btn btn-ghost" onClick={close} style={{ marginTop: '1rem' }}>Skip Review</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay active">
            <div className="modal-content chat-modal">
                <header className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Negotiation Channel</h3>
                        <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                            {currentUser.role === 'poster'
                                ? `Chatting with ${application.worker_name}`
                                : `Chatting with ${application.job_details?.poster_name}`}
                            <span className={`status-pill ${status}`} style={{ marginLeft: '10px', fontSize: '0.7rem' }}>{status.toUpperCase()}</span>
                        </p>
                    </div>
                    <button className="modal-close" onClick={close} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </header>

                <div className="chat-body-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
                    {/* Wage / Action Bar */}
                    <div className="wage-negotiation-bar card-shiny" style={{ margin: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', borderRadius: '8px', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: 'bold' }}>Final Wage (₹):</label>
                        <input
                            type="number"
                            value={wage}
                            onChange={(e) => setWage(e.target.value)}
                            disabled={currentUser.role === 'worker' || isFinalized || status === 'rejected' || status === 'completed'}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100px', background: (isFinalized || status !== 'pending' && status !== 'approved') ? '#e2e8f0' : 'white' }}
                        />

                        {/* Poster Actions */}
                        {currentUser.role === 'poster' && (
                            <>
                                {/* Appoint / Wage Lock */}
                                {!isFinalized && status === 'pending' && (
                                    <>
                                        <button className="btn btn-sm btn-primary" onClick={handleWageUpdate}>Appoint Worker</button>
                                        <button className="btn btn-sm btn-danger" style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={handleReject}>Reject</button>
                                    </>
                                )}

                                {/* Job Completion */}
                                {status === 'approved' && isFinalized && (
                                    <button className="btn btn-sm btn-emerald" style={{ marginLeft: 'auto' }} onClick={handleComplete}>Mark Job Completed</button>
                                )}
                            </>
                        )}

                        {/* Worker View */}
                        {currentUser.role === 'worker' && IsPosterAppointed(status) && (
                            <span className="status-badge-premium verified" style={{ marginLeft: 'auto' }}>APPOINTED</span>
                        )}
                    </div>

                    <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                        {loading ? <p>Loading chat...</p> : messages.map((msg) => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender === currentUser.id ? 'sent' : 'received'}`}>
                                <div className="msg-header" style={{ fontSize: '0.75rem', marginBottom: '2px', opacity: 0.8 }}>
                                    {msg.sender_name || (msg.sender === currentUser.id ? 'You' : 'User')}
                                </div>
                                <div className="msg-content">{msg.message}</div>
                                <div className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        ))}
                        {messages.length === 0 && !loading && (
                            <p className="empty-chat">Start the conversation about details and pricing.</p>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area" style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={status === 'rejected' || status === 'completed'}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #cbd5e1' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '0 1.5rem' }} disabled={status === 'rejected' || status === 'completed'}>Send</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function IsPosterAppointed(status) {
    return status === 'approved' || status === 'completed';
}
