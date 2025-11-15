import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard({ user }) {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");

  // New member form state
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    join_date: "",
    plan_id: "",
    address: ""
  });

  // New trainer form state
  const [newTrainer, setNewTrainer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
    hourly_rate: ""
  });

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    member_id: "",
    plan_id: "",
    amount: "",
    payment_date: "",
    payment_method: "Cash"
  });

  // Form visibility states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch data on load
  useEffect(() => {
    fetchMembers();
    fetchTrainers();
    fetchPlans();
    fetchTodayAttendance();
    fetchPayments();
    fetchPaymentStats();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/members");
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/trainers");
      setTrainers(res.data);
    } catch (err) {
      console.error("Error fetching trainers:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/today");
      setAttendance(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments/stats");
      setPaymentStats(res.data);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  };

  // Handlers for member form
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrainerChange = (e) => {
    const { name, value } = e.target;
    setNewTrainer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Sending member data:", newMember);
      
      const res = await axios.post("http://localhost:5000/api/members", newMember);
      if (res.data.success) {
        alert("✅ Member added successfully!");
        setNewMember({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          date_of_birth: "",
          join_date: "",
          plan_id: "",
          address: ""
        });
        setShowMemberForm(false);
        fetchMembers();
      }
    } catch (err) {
      console.error("Full error details:", err);
      const errorMessage = err.response?.data?.message || "Failed to add member";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Add Trainer
  const handleAddTrainer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/api/trainers", newTrainer);
      if (res.data.success) {
        alert("✅ Trainer added successfully!");
        setNewTrainer({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          specialization: "",
          hourly_rate: ""
        });
        setShowTrainerForm(false);
        fetchTrainers();
      }
    } catch (err) {
      console.error("Full error details:", err);
      const errorMessage = err.response?.data?.message || "Failed to add trainer";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Add Payment
  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/api/payments", newPayment);
      if (res.data.success) {
        alert("✅ Payment recorded successfully!");
        setNewPayment({
          member_id: "",
          plan_id: "",
          amount: "",
          payment_date: "",
          payment_method: "Cash"
        });
        setShowPaymentForm(false);
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      console.error("Full error details:", err);
      const errorMessage = err.response?.data?.message || "Failed to record payment";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Payment Status
  const handleUpdatePaymentStatus = async (paymentId, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/payments/${paymentId}`, { status });
      if (res.data.success) {
        alert("✅ Payment status updated!");
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      alert("❌ Error updating payment status");
      console.error(err);
    }
  };

  // Generate Monthly Bills
  const handleGenerateBills = async () => {
    if (!window.confirm("Generate monthly bills for all active members?")) return;
    
    try {
      const res = await axios.post("http://localhost:5000/api/billing/generate");
      if (res.data.success) {
        alert(`✅ ${res.data.message}`);
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      alert("❌ Error generating bills");
      console.error(err);
    }
  };

  // Attendance functions
  const handleCheckIn = async (memberId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/checkin", {
        member_id: memberId
      });
      
      if (res.data.success) {
        alert("✅ Member checked in successfully!");
        fetchTodayAttendance();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to check in";
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/checkout", {
        member_id: memberId
      });
      
      if (res.data.success) {
        alert("✅ Member checked out successfully!");
        fetchTodayAttendance();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to check out";
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleQuickCheckIn = async () => {
    if (!selectedMember) {
      alert("Please select a member");
      return;
    }
    
    await handleCheckIn(selectedMember);
    setSelectedMember("");
  };

  // Cancel forms
  const handleCancelMember = () => {
    setShowMemberForm(false);
    setNewMember({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      join_date: "",
      plan_id: "",
      address: ""
    });
  };

  const handleCancelTrainer = () => {
    setShowTrainerForm(false);
    setNewTrainer({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialization: "",
      hourly_rate: ""
    });
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setNewPayment({
      member_id: "",
      plan_id: "",
      amount: "",
      payment_date: "",
      payment_method: "Cash"
    });
  };

  // Get today's date in YYYY-MM-DD format for date inputs
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate today's stats
  const todayStats = {
    checkedIn: attendance.filter(a => a.check_out === null).length,
    totalVisits: attendance.length,
    averageDuration: attendance.length > 0 
      ? Math.round(attendance.reduce((sum, a) => sum + (a.workout_duration_minutes || 0), 0) / attendance.length)
      : 0
  };

  // Auto-fill amount when plan is selected
  const handlePlanSelect = (planId) => {
    const selectedPlan = plans.find(plan => plan.plan_id == planId);
    if (selectedPlan) {
      setNewPayment(prev => ({
        ...prev,
        plan_id: planId,
        amount: selectedPlan.price
      }));
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="welcome">Welcome, {user?.username || "Admin"}!</h1>
      
      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          📝 Attendance
        </button>
        <button 
          className={`tab ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          💰 Payments
        </button>
        <button 
          className={`tab ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          💪 Members
        </button>
        <button 
          className={`tab ${activeTab === "trainers" ? "active" : ""}`}
          onClick={() => setActiveTab("trainers")}
        >
          🏋️ Trainers
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="overview">
          <div className="stats">
            <div className="stat-card">
              <h3>Total Members</h3>
              <p>{members.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Trainers</h3>
              <p>{trainers.length}</p>
            </div>
            <div className="stat-card">
              <h3>Monthly Revenue</h3>
              <p>{formatCurrency(paymentStats.completed_revenue || 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Visits</h3>
              <p>{todayStats.totalVisits}</p>
            </div>
            <div className="stat-card">
              <h3>Currently In Gym</h3>
              <p>{todayStats.checkedIn}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p>{paymentStats.pending_payments || 0}</p>
            </div>
          </div>

          {/* Quick Check-in Section */}
          <div className="section">
            <h2>🚀 Quick Check-in</h2>
            <div className="quick-checkin">
              <select 
                value={selectedMember} 
                onChange={(e) => setSelectedMember(e.target.value)}
                className="member-select"
              >
                <option value="">Select Member</option>
                {members.map(member => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
              <button 
                onClick={handleQuickCheckIn}
                className="checkin-btn"
                disabled={!selectedMember}
              >
                Check In
              </button>
            </div>
          </div>

          // In the Overview tab, replace the Today's Attendance section with this:

{/* Today's Attendance */}
<div className="section">
  <h2>📊 Today's Attendance ({new Date().toLocaleDateString()})</h2>
  <table className="data-table">
    <thead>
      <tr>
        <th>Member</th>
        <th>Check-in</th>
        <th>Check-out</th>
        <th>Duration</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {attendance.map((record) => (
        <tr key={record.attendance_id}>
          <td>{record.first_name} {record.last_name}</td>
          <td>{formatTime(record.check_in)}</td>
          <td>{record.check_out ? formatTime(record.check_out) : '-'}</td>
          <td>{record.workout_duration_minutes || '-'} min</td>
          <td>
            <span className={`status ${record.check_out ? 'completed' : 'active'}`}>
              {record.check_out ? 'Completed' : 'In Gym'}
            </span>
          </td>
          <td>
            {!record.check_out && (
              <button 
                onClick={() => handleCheckOut(record.member_id)}
                className="checkout-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Check Out
              </button>
            )}
          </td>
        </tr>
      ))}
      {attendance.length === 0 && (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
            No attendance records for today
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
          {/* Recent Payments */}
          <div className="section">
            <h2>💰 Recent Payments</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.first_name} {payment.last_name}</td>
                    <td>{payment.plan_name}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="section">
          <h2>📝 Attendance Management</h2>
          
          {/* Manual Check-in/Check-out */}
          <div className="attendance-controls">
            <h3>Manual Attendance</h3>
            <div className="attendance-buttons">
              {members.map(member => {
                const todayRecord = attendance.find(a => 
                  a.member_id === member.member_id && 
                  a.date === new Date().toISOString().split('T')[0]
                );
                
                return (
                  <div key={member.member_id} className="member-attendance-card">
                    <div className="member-info">
                      <strong>{member.first_name} {member.last_name}</strong>
                      <span>{member.phone}</span>
                    </div>
                    <div className="attendance-actions">
                      {!todayRecord ? (
                        <button 
                          onClick={() => handleCheckIn(member.member_id)}
                          className="checkin-btn"
                        >
                          Check In
                        </button>
                      ) : todayRecord.check_out ? (
                        <span className="status completed">Completed</span>
                      ) : (
                        <button 
                          onClick={() => handleCheckOut(member.member_id)}
                          className="checkout-btn"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance History */}
          <div className="attendance-history">
            <h3>Recent Attendance</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 10).map((record) => (
                  <tr key={record.attendance_id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.first_name} {record.last_name}</td>
                    <td>{formatTime(record.check_in)}</td>
                    <td>{record.check_out ? formatTime(record.check_out) : '-'}</td>
                    <td>{record.workout_duration_minutes || '-'} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="section">
          <div className="section-header">
            <h2>💰 Payments & Billing</h2>
            <div className="action-buttons">
              <button 
                className="generate-bills-btn"
                onClick={handleGenerateBills}
              >
                🗓️ Generate Monthly Bills
              </button>
              <button 
                className="add-btn"
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                disabled={loading}
              >
                {showPaymentForm ? "✕ Cancel" : "➕ Record Payment"}
              </button>
            </div>
          </div>

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="form-container">
              <h3>Record New Payment</h3>
              <form onSubmit={handleAddPayment} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Member *</label>
                    <select 
                      name="member_id" 
                      value={newPayment.member_id} 
                      onChange={handlePaymentChange}
                      required
                    >
                      <option value="">Select Member</option>
                      {members.map(member => (
                        <option key={member.member_id} value={member.member_id}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Plan *</label>
                    <select 
                      name="plan_id" 
                      value={newPayment.plan_id} 
                      onChange={(e) => {
                        handlePaymentChange(e);
                        handlePlanSelect(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select Plan</option>
                      {plans.map(plan => (
                        <option key={plan.plan_id} value={plan.plan_id}>
                          {plan.plan_name} - {formatCurrency(plan.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount *</label>
                    <input 
                      name="amount" 
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={newPayment.amount} 
                      onChange={handlePaymentChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Date *</label>
                    <input 
                      name="payment_date" 
                      type="date"
                      value={newPayment.payment_date} 
                      onChange={handlePaymentChange} 
                      required 
                      max={getTodayDate()}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select 
                      name="payment_method" 
                      value={newPayment.payment_method} 
                      onChange={handlePaymentChange}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Processing..." : "Record Payment"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancelPayment} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payments Table */}
          <div className="payments-section">
            <h3>All Payments</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Due Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.payment_id}</td>
                    <td>{payment.first_name} {payment.last_name}</td>
                    <td>{payment.plan_name}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      {payment.status === 'Pending' && (
                        <button 
                          className="mark-paid-btn"
                          onClick={() => handleUpdatePaymentStatus(payment.payment_id, 'Completed')}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="section">
          <div className="section-header">
            <h2>💪 Members List</h2>
            <button 
              className="add-btn"
              onClick={() => setShowMemberForm(!showMemberForm)}
              disabled={loading}
            >
              {showMemberForm ? "✕ Cancel" : "➕ Add Member"}
            </button>
          </div>

          {/* Add Member Form */}
          {showMemberForm && (
            <div className="form-container">
              <h3>Add New Member</h3>
              <form onSubmit={handleAddMember} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      name="first_name" 
                      placeholder="First Name" 
                      value={newMember.first_name} 
                      onChange={handleMemberChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input 
                      name="last_name" 
                      placeholder="Last Name" 
                      value={newMember.last_name} 
                      onChange={handleMemberChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Email" 
                      value={newMember.email} 
                      onChange={handleMemberChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input 
                      name="phone" 
                      placeholder="Phone" 
                      value={newMember.phone} 
                      onChange={handleMemberChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                      name="date_of_birth" 
                      type="date" 
                      value={newMember.date_of_birth} 
                      onChange={handleMemberChange} 
                      max={getTodayDate()}
                    />
                  </div>
                  <div className="form-group">
                    <label>Join Date *</label>
                    <input 
                      name="join_date" 
                      type="date" 
                      value={newMember.join_date} 
                      onChange={handleMemberChange} 
                      required 
                      max={getTodayDate()}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Membership Plan *</label>
                    <select name="plan_id" value={newMember.plan_id} onChange={handleMemberChange} required>
                      <option value="">Select Membership Plan</option>
                      {plans.map((plan) => (
                        <option key={plan.plan_id} value={plan.plan_id}>
                          {plan.plan_name} - {formatCurrency(plan.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input 
                      name="address" 
                      placeholder="Address" 
                      value={newMember.address} 
                      onChange={handleMemberChange} 
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Adding..." : "Add Member"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancelMember} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.member_id}>
                  <td>{member.member_id}</td>
                  <td>{member.first_name} {member.last_name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{new Date(member.join_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${member.membership_status?.toLowerCase() || 'active'}`}>
                      {member.membership_status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trainers Tab */}
      {activeTab === "trainers" && (
        <div className="section">
          <div className="section-header">
            <h2>🏋️ Trainers List</h2>
            <button 
              className="add-btn"
              onClick={() => setShowTrainerForm(!showTrainerForm)}
              disabled={loading}
            >
              {showTrainerForm ? "✕ Cancel" : "👨‍💼 Add Trainer"}
            </button>
          </div>

          {/* Add Trainer Form */}
          {showTrainerForm && (
            <div className="form-container">
              <h3>Add New Trainer</h3>
              <form onSubmit={handleAddTrainer} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      name="first_name" 
                      placeholder="First Name" 
                      value={newTrainer.first_name} 
                      onChange={handleTrainerChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input 
                      name="last_name" 
                      placeholder="Last Name" 
                      value={newTrainer.last_name} 
                      onChange={handleTrainerChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Email" 
                      value={newTrainer.email} 
                      onChange={handleTrainerChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input 
                      name="phone" 
                      placeholder="Phone" 
                      value={newTrainer.phone} 
                      onChange={handleTrainerChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Specialization *</label>
                    <input 
                      name="specialization" 
                      placeholder="Specialization" 
                      value={newTrainer.specialization} 
                      onChange={handleTrainerChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate ($) *</label>
                    <input 
                      name="hourly_rate" 
                      type="number" 
                      placeholder="Hourly Rate" 
                      value={newTrainer.hourly_rate} 
                      onChange={handleTrainerChange} 
                      required 
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Adding..." : "Add Trainer"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancelTrainer} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trainers Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Hourly Rate</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer) => (
                <tr key={trainer.trainer_id}>
                  <td>{trainer.trainer_id}</td>
                  <td>{trainer.first_name} {trainer.last_name}</td>
                  <td>{trainer.email}</td>
                  <td>{trainer.phone}</td>
                  <td>{trainer.specialization}</td>
                  <td>{formatCurrency(trainer.hourly_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;