import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Search,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { driversService } from '../../api/driversService';
import { Driver, DriverStatus } from '../../types/driver';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DriverDirectoryPage: React.FC = () => {
  const { can, activeRole } = useAuth();
  const { showToast } = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Suspension Modal State
  const [suspendingDriver, setSuspendingDriver] = useState<Driver | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await driversService.getDrivers();
      setDrivers(data);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleConfirmSuspend = async () => {
    if (!suspendingDriver || !suspendReason.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'Reason for suspension is mandatory.' });
      return;
    }

    try {
      await driversService.suspendDriver(suspendingDriver.id, suspendReason);
      showToast({
        type: 'warning',
        title: 'Driver Suspended',
        message: `${suspendingDriver.name} is now Suspended. Dispatch access immediately revoked.`,
      });
      setSuspendingDriver(null);
      setSuspendReason('');
      loadDrivers();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleReinstate = async (driver: Driver) => {
    if (!window.confirm(`Reinstate ${driver.name} to active commercial driver roster?`)) return;

    try {
      await driversService.reinstateDriver(driver.id);
      showToast({
        type: 'success',
        title: 'Driver Reinstated',
        message: `${driver.name} has been restored to Available status.`,
      });
      loadDrivers();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDriverBadgeVariant = (status: DriverStatus) => {
    switch (status) {
      case 'Available': return 'available';
      case 'On Trip': return 'ontrip';
      case 'Suspended': return 'critical';
      case 'Off Duty': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Driver Intelligence & Compliance</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Commercial CDL tracking, license expiration alerts, authoritative safety scores, and disciplinary controls.
          </p>
        </div>

        {can('canSuspendDrivers') && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-100)',
              color: 'var(--color-olive-800)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Shield size={16} /> Safety Officer Powers Active
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search driver name, license, contact..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Suspended">Suspended</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>License No. & Category</th>
              <th>License Validity</th>
              <th>Contact Details</th>
              <th>Safety Score</th>
              <th>Trips / Violations</th>
              <th>Operational Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading Driver Directory...
                </td>
              </tr>
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No drivers found matching criteria.
                </td>
              </tr>
            ) : (
              filteredDrivers.map(driver => (
                <tr key={driver.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{driver.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Member since {driver.joinedDate}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{driver.licenseNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{driver.licenseCategory}</div>
                  </td>

                  <td>
                    {driver.daysUntilExpiry <= 0 ? (
                      <div>
                        <Badge variant="critical">EXPIRED ({Math.abs(driver.daysUntilExpiry)}d ago)</Badge>
                        <div style={{ fontSize: '0.72rem', color: 'var(--status-critical-text)', marginTop: '0.2rem' }}>
                          Dispatch Prohibited
                        </div>
                      </div>
                    ) : driver.daysUntilExpiry < 30 ? (
                      <div>
                        <Badge variant="warning">{driver.daysUntilExpiry} days remaining</Badge>
                        <div style={{ fontSize: '0.72rem', color: 'var(--status-warning-text)', marginTop: '0.2rem' }}>
                          Expires: {driver.licenseExpiryDate}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="available">Valid ({driver.daysUntilExpiry}d)</Badge>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Expires: {driver.licenseExpiryDate}
                        </div>
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <Phone size={13} color="var(--text-muted)" /> {driver.contactNumber}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <Mail size={13} /> {driver.email}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={15} color={driver.safetyScore >= 90 ? 'var(--color-olive-600)' : '#C47828'} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{driver.safetyScore}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      <strong>{driver.tripsCompleted}</strong> hauls completed
                    </div>
                    <div style={{ fontSize: '0.72rem', color: driver.violationCount > 0 ? 'var(--status-critical-text)' : 'var(--text-muted)' }}>
                      {driver.violationCount} violation{driver.violationCount !== 1 ? 's' : ''}
                    </div>
                  </td>

                  <td>
                    <Badge variant={getDriverBadgeVariant(driver.status)}>{driver.status}</Badge>
                    {driver.status === 'Suspended' && driver.suspendedReason && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--status-critical-text)', maxWidth: '200px', marginTop: '0.2rem' }}>
                        {driver.suspendedReason}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {can('canSuspendDrivers') && (
                      driver.status === 'Suspended' ? (
                        <button
                          onClick={() => handleReinstate(driver)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                        >
                          <RotateCcw size={14} /> Reinstate
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendingDriver(driver)}
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          title="Suspend Driver"
                        >
                          <Ban size={14} /> Suspend
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Suspend Driver Modal */}
      <Modal
        isOpen={!!suspendingDriver}
        onClose={() => setSuspendingDriver(null)}
        title={`Suspend Driver: ${suspendingDriver?.name}`}
        subtitle="Disciplinary action revokes immediate dispatch pool eligibility"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-critical-bg)',
              color: 'var(--status-critical-text)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
            }}
          >
            <strong>Warning:</strong> Suspending this driver will immediately block any future trip assignments and flag the driver in the Smart Dispatch Engine.
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Suspension / Disciplinary Incident *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="e.g. Telemetry violation exceeding speed limit by >20mph on Route 80; pending incident review."
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setSuspendingDriver(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirmSuspend} className="btn btn-danger">
              Confirm Suspension
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
