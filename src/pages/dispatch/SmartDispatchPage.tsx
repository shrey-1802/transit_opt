import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Truck,
  UserCheck,
  Package,
  MapPin,
  IndianRupee,
  Play,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { dispatchService } from '../../api/dispatchService';
import { vehiclesService } from '../../api/vehiclesService';
import { driversService } from '../../api/driversService';
import { Trip, TripStatus, DispatchPreValidationResult } from '../../types/trip';
import { Vehicle } from '../../types/vehicle';
import { Driver } from '../../types/driver';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber, formatINR } from '../../utils/formatters';

export const SmartDispatchPage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Dispatch Form State
  const [formData, setFormData] = useState({
    source: 'Chicago Central Logistics Yard',
    destination: 'Indianapolis Regional Depot',
    vehicleId: '',
    driverId: '',
    cargoDescription: 'Standard Palletized Freight',
    cargoWeightKg: 15000,
    plannedDistanceKm: 295,
    revenue: 2850,
  });

  // Pre-validation state
  const [validationResult, setValidationResult] = useState<DispatchPreValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completion Modal
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [finalOdometer, setFinalOdometer] = useState<number>(0);
  const [fuelConsumed, setFuelConsumed] = useState<number>(85);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [tripsData, vehData, drvData] = await Promise.all([
        dispatchService.getTrips(),
        vehiclesService.getVehicles(),
        driversService.getDrivers(),
      ]);
      setTrips(tripsData);
      setVehicles(vehData);
      setDrivers(drvData);

      // Auto-select first available vehicle and driver if not selected
      const firstAvailableVeh = vehData.find(v => v.status === 'Available');
      const firstAvailableDrv = drvData.find(d => d.status === 'Available' && d.isLicenseValid);

      setFormData(prev => ({
        ...prev,
        vehicleId: prev.vehicleId || (firstAvailableVeh ? firstAvailableVeh.id : ''),
        driverId: prev.driverId || (firstAvailableDrv ? firstAvailableDrv.id : ''),
      }));
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Run validation whenever selection changes
  useEffect(() => {
    if (!formData.vehicleId || !formData.driverId) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    const runValidation = async () => {
      try {
        const result = await dispatchService.validateDispatch({
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          cargoWeightKg: formData.cargoWeightKg,
        });
        setValidationResult(result);
      } catch (err: any) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    };

    const timeout = setTimeout(runValidation, 150);
    return () => clearTimeout(timeout);
  }, [formData.vehicleId, formData.driverId, formData.cargoWeightKg]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult?.isValid) {
      showToast({
        type: 'error',
        title: 'Dispatch Rejected',
        message: validationResult?.errors.join(' ') || 'Pre-dispatch constraints violated.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newTrip = await dispatchService.dispatchTrip(formData);
      showToast({
        type: 'success',
        title: 'Trip Dispatched Atomically',
        message: `${newTrip.tripCode} dispatched! Vehicle & Driver statuses transitioned to On Trip.`,
      });
      await loadAll();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Dispatch Failed', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!completingTrip) return;
    try {
      await dispatchService.completeTrip(completingTrip.id, {
        finalOdometer,
        fuelConsumedLiters: fuelConsumed,
      });
      showToast({
        type: 'success',
        title: 'Trip Completed',
        message: `${completingTrip.tripCode} closed. Vehicle & Driver restored to Available status.`,
      });
      setCompletingTrip(null);
      await loadAll();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleCancelTrip = async (tripId: string, tripCode: string) => {
    const reason = window.prompt(`Confirm cancellation for trip ${tripCode}. Provide reason:`);
    if (!reason) return;

    try {
      await dispatchService.cancelTrip(tripId, reason);
      showToast({
        type: 'warning',
        title: 'Trip Cancelled',
        message: `${tripCode} cancelled. Vehicle & Driver restored to pool.`,
      });
      await loadAll();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Cancellation Failed', message: err.message });
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
  const selectedDriver = drivers.find(d => d.id === formData.driverId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Dispatch Engine</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Automated multi-entity dispatch validation, payload safety limits, and atomic state transitions.
        </p>
      </div>

      {/* Dispatch Creator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Dispatch Order Form */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="var(--color-olive-700)" />
                Create & Dispatch Haul
              </div>
              <div className="card-subtitle">Enforces real-time capacity and compliance checks before locking</div>
            </div>
          </div>

          <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Origin & Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--color-olive-600)" /> Origin Facility *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#C47828" /> Destination Hub *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Truck size={14} color="var(--color-olive-600)" /> Select Transport Asset *
              </label>
              <select
                className="form-control"
                value={formData.vehicleId}
                onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map(v => {
                  const isBlocked = v.status !== 'Available';
                  return (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.model} ({v.type}) [Max {formatNumber(v.maxLoadCapacity)} kg] — {v.status} {isBlocked ? `[BLOCKED: ${v.status}]` : '[ELIGIBLE]'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Driver Selection */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={14} color="var(--color-olive-600)" /> Assign Commercial Driver *
              </label>
              <select
                className="form-control"
                value={formData.driverId}
                onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                required
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map(d => {
                  const isBlocked = d.status !== 'Available' || !d.isLicenseValid || d.daysUntilExpiry <= 0;
                  return (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseCategory}) [Exp: {d.daysUntilExpiry}d] — {d.status} {isBlocked ? `[BLOCKED]` : '[ELIGIBLE]'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cargo Payload & Distance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Cargo Weight (kg) *</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min={100}
                  value={formData.cargoWeightKg}
                  onChange={e => setFormData({ ...formData, cargoWeightKg: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Planned Distance (km)</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  value={formData.plannedDistanceKm}
                  onChange={e => setFormData({ ...formData, plannedDistanceKm: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trip Revenue (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={formData.revenue}
                  onChange={e => setFormData({ ...formData, revenue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cargo Manifest Description</label>
              <input
                type="text"
                className="form-control"
                value={formData.cargoDescription}
                onChange={e => setFormData({ ...formData, cargoDescription: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!can('canDispatchTrips') || !validationResult?.isValid || isSubmitting}
              style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Atomically Transitioning Trip State...' : 'Authorize & Dispatch Haul'}
            </button>
          </form>
        </div>

        {/* Real-time Pre-Validation Matrix */}
        <div className="card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Pre-Dispatch Safety Matrix</div>
              <div className="card-subtitle">Zero-tolerance rule enforcement before state lock</div>
            </div>
            {validationResult && (
              <Badge variant={validationResult.isValid ? 'available' : 'critical'}>
                {validationResult.isValid ? 'CLEARED' : 'DISPATCH BLOCKED'}
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
            {/* Vehicle Checks */}
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Asset Availability & Capacity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {validationResult?.vehicleCheck.isAvailable ? (
                    <CheckCircle2 size={16} color="var(--color-olive-600)" />
                  ) : (
                    <XCircle size={16} color="var(--status-critical-text)" />
                  )}
                  <span>Status Available (not On Trip, In Shop, or Retired)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {validationResult?.vehicleCheck.capacitySufficient ? (
                    <CheckCircle2 size={16} color="var(--color-olive-600)" />
                  ) : (
                    <XCircle size={16} color="var(--status-critical-text)" />
                  )}
                  <span>
                    Cargo ({formatNumber(formData.cargoWeightKg)} kg) ≤ Max Capacity (
                    {selectedVehicle ? `${formatNumber(selectedVehicle.maxLoadCapacity)} kg` : '—'})
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Checks */}
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Driver Licensing & Legal Compliance
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {validationResult?.driverCheck.isAvailable ? (
                    <CheckCircle2 size={16} color="var(--color-olive-600)" />
                  ) : (
                    <XCircle size={16} color="var(--status-critical-text)" />
                  )}
                  <span>Driver Available (not On Trip or Off Duty)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {validationResult?.driverCheck.isNotSuspended ? (
                    <CheckCircle2 size={16} color="var(--color-olive-600)" />
                  ) : (
                    <XCircle size={16} color="var(--status-critical-text)" />
                  )}
                  <span>Safety Officer Clearance (not Suspended)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {validationResult?.driverCheck.isLicenseValid ? (
                    <CheckCircle2 size={16} color="var(--color-olive-600)" />
                  ) : (
                    <XCircle size={16} color="var(--status-critical-text)" />
                  )}
                  <span>Commercial License Valid (Days remaining: {validationResult?.driverCheck.daysUntilExpiry ?? '—'})</span>
                </div>
              </div>
            </div>

            {/* Error / Warning Feed */}
            {validationResult?.errors && validationResult.errors.length > 0 && (
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-critical-bg)',
                  border: '1px solid var(--status-critical-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-critical-text)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <ShieldAlert size={15} /> Dispatch Safety Lock Engaged:
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: 'var(--status-critical-text)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult?.warnings && validationResult.warnings.length > 0 && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-warning-bg)',
                  border: '1px solid var(--status-warning-border)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--status-warning-text)', fontWeight: 600 }}>
                  {validationResult.warnings.join(' ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Registry & Lifecycle Status Machine */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Active & Historical Trip Lifecycle Machine</div>
            <div className="card-subtitle">
              Lifecycle: Draft → Dispatched → In Progress → Completed / Cancelled
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Route Corridor</th>
                <th>Assigned Asset</th>
                <th>Assigned Driver</th>
                <th>Payload (kg)</th>
                <th>Revenue</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No trips in dispatch engine.
                  </td>
                </tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 700 }}>{trip.tripCode}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{trip.source}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ {trip.destination}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-olive-700)' }}>{trip.vehicleReg}</span>
                    </td>
                    <td>{trip.driverName}</td>
                    <td>{formatNumber(trip.cargoWeightKg)} kg</td>
                    <td>{formatINR(trip.revenue)}</td>
                    <td>
                      <Badge
                        variant={
                          trip.status === 'Completed'
                            ? 'available'
                            : trip.status === 'Dispatched' || trip.status === 'In Progress'
                            ? 'ontrip'
                            : trip.status === 'Cancelled'
                            ? 'retired'
                            : 'neutral'
                        }
                      >
                        {trip.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {(trip.status === 'Dispatched' || trip.status === 'In Progress') && can('canCompleteTrips') && (
                          <button
                            onClick={() => {
                              setCompletingTrip(trip);
                              const veh = vehicles.find(v => v.id === trip.vehicleId);
                              setFinalOdometer((veh?.odometer || trip.startOdometer) + trip.plannedDistanceKm);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--color-olive-700)' }}
                          >
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        )}
                        {(trip.status === 'Dispatched' || trip.status === 'In Progress' || trip.status === 'Draft') && can('canCompleteTrips') && (
                          <button
                            onClick={() => handleCancelTrip(trip.id, trip.tripCode)}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem', color: 'var(--status-critical-text)' }}
                            title="Cancel Dispatch"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Trip Modal */}
      <Modal
        isOpen={!!completingTrip}
        onClose={() => setCompletingTrip(null)}
        title={`Complete Delivery: ${completingTrip?.tripCode}`}
        subtitle="Log closing telemetry and restore asset/driver to Available pool"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Closing Odometer (km) *</label>
            <input
              type="number"
              className="form-control"
              required
              min={completingTrip?.startOdometer || 0}
              value={finalOdometer}
              onChange={e => setFinalOdometer(Number(e.target.value))}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Start odometer was {completingTrip ? formatNumber(completingTrip.startOdometer) : '—'} km
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Actual Fuel Consumed (Liters)</label>
            <input
              type="number"
              className="form-control"
              min={1}
              value={fuelConsumed}
              onChange={e => setFuelConsumed(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setCompletingTrip(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCompleteTrip} className="btn btn-primary">
              Authorize Delivery Completion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
