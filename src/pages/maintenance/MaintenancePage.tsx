import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  IndianRupee,
  Truck,
  Check
} from 'lucide-react';
import { maintenanceService } from '../../api/maintenanceService';
import { vehiclesService } from '../../api/vehiclesService';
import { MaintenanceRecord, MaintenancePriority } from '../../types/maintenance';
import { Vehicle } from '../../types/vehicle';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber, formatINR } from '../../utils/formatters';

export const MaintenancePage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'Preventive Service Inspection',
    priority: 'Routine' as MaintenancePriority,
    description: '',
    cost: 850,
    technicianOrShop: 'Central Maintenance Bay #2',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recData, vehData] = await Promise.all([
        maintenanceService.getMaintenanceRecords(),
        vehiclesService.getVehicles(),
      ]);
      setRecords(recData);
      setVehicles(vehData);
      if (vehData.length > 0 && !formData.vehicleId) {
        setFormData(prev => ({ ...prev, vehicleId: vehData[0].id }));
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      showToast({ type: 'error', title: 'Validation', message: 'Select a vehicle.' });
      return;
    }

    try {
      const created = await maintenanceService.createMaintenance(formData);
      showToast({
        type: 'warning',
        title: 'Vehicle Placed In Shop',
        message: `Work order created for ${created.vehicleReg}. Asset moved to In Shop status and removed from dispatch pool.`,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Order Failed', message: err.message });
    }
  };

  const handleCloseOrder = async (recordId: string, vehicleReg: string) => {
    try {
      await maintenanceService.closeMaintenance(recordId);
      showToast({
        type: 'success',
        title: 'Maintenance Closed',
        message: `Work order closed for ${vehicleReg}. Vehicle restored to Available status.`,
      });
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Close Failed', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Maintenance & Workshop Intelligence</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Predictive odometer intervals, bay work orders, and automatic vehicle dispatch-lock enforcement.
          </p>
        </div>

        {can('canManageMaintenance') && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Open Work Order
          </button>
        )}
      </div>

      {/* Fleet Service Progress Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Fleet Service Milestones & Interval Progress</div>
            <div className="card-subtitle">
              Calculates current vs next scheduled service interval based on odometer telemetry
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {vehicles.map(v => {
            const nextOdometer = v.lastServiceOdometer + v.serviceIntervalKm;
            const progress = Math.min(100, Math.round(((v.odometer - v.lastServiceOdometer) / v.serviceIntervalKm) * 100));
            const isDueSoon = progress >= 80;

            return (
              <div
                key={v.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: `1px solid ${isDueSoon ? 'var(--status-warning-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.registrationNumber}</div>
                  <Badge variant={v.status === 'In Shop' ? 'inshop' : v.status === 'Available' ? 'available' : 'neutral'}>
                    {v.status}
                  </Badge>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  {v.model} • Odo: {formatNumber(v.odometer)} km
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Interval Progress</span>
                  <span style={{ fontWeight: 700, color: isDueSoon ? '#C47828' : 'var(--color-olive-700)' }}>
                    {progress}%
                  </span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-medium)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: isDueSoon ? '#C47828' : 'var(--color-olive-600)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  <span>Last: {formatNumber(v.lastServiceOdometer)} km</span>
                  <span>Next: {formatNumber(nextOdometer)} km</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active & Closed Work Orders */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Workshop Work Order Register</div>
            <div className="card-subtitle">
              Active repair tasks isolate vehicles from dispatch until technicians mark work complete
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Task / Repair Type</th>
                <th>Priority</th>
                <th>Technician / Facility</th>
                <th>Start Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-olive-700)' }}>{rec.vehicleReg}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Odo @ Service: {formatNumber(rec.odometerAtService)} km
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.type}</div>
                      {rec.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                          {rec.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant={rec.priority === 'High' ? 'warning' : 'olive'}>{rec.priority}</Badge>
                    </td>
                    <td>{rec.technicianOrShop}</td>
                    <td>{rec.startDate.split('T')[0]}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(rec.cost)}</td>
                    <td>
                      <Badge variant={rec.status === 'Completed' ? 'available' : 'inshop'}>{rec.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {rec.status === 'In Progress' && can('canManageMaintenance') && (
                        <button
                          onClick={() => handleCloseOrder(rec.id, rec.vehicleReg)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: 'var(--color-olive-700)' }}
                        >
                          <Check size={14} /> Close & Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Work Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open Maintenance Work Order"
        subtitle="Moving an asset into maintenance removes it from dispatch pool"
      >
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Transport Vehicle *</label>
            <select
              className="form-control"
              required
              value={formData.vehicleId}
              onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.model} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Service Type / Work Description *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Brake Caliper & Pad Overhaul"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-control"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="Routine">Routine</option>
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Cost (₹)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Center / Technician</label>
            <input
              type="text"
              className="form-control"
              value={formData.technicianOrShop}
              onChange={e => setFormData({ ...formData, technicianOrShop: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Diagnostic Notes</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Inspection notes, replacement parts..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
